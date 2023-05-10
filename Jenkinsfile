pipeline {
    agent any
    tools {nodejs "nodejs-16"}
    environment {
        scannerHome = tool 'SonarQubeScan'
        ECR_URL = '941924953828.dkr.ecr.us-east-2.amazonaws.com'
        REPOSITORY = getRepositoryName(env.BRANCH_NAME)
        CODE_DIR_NAME = getCodeDirName(env.BRANCH_NAME)
        K8S_DIR_NAME = getK8sDirName(env.BRANCH_NAME)
        SERVER_IP = getServerIp(env.BRANCH_NAME)
    }
    stages {
        stage('get_commit_msg') {
            steps {
              script {
                notifyStarted()
                passedBuilds = []
                lastSuccessfulBuild(passedBuilds, currentBuild);
                env.changeLog = getChangeLog(passedBuilds)
                echo "changeLog \n${env.changeLog}"
              }
            }
        }
        stage('Dev Build') {
            when {
                branch 'dev'
            }
            parallel{
                stage('Sonar Analysis'){
                    steps {
                        withSonarQubeEnv(installationName: 'SonarQube') {
                            sh "${scannerHome}/bin/sonar-scanner"
                        }
                    }
                }
                stage('Build And Deploy'){
                    steps {
                        script {
                            sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
                            sh '''
                            ssh -tt -o StrictHostKeyChecking=no root@$SERVER_IP -p 3030 << EOF
                            cd $CODE_DIR_NAME; \
                            git pull origin dev; \
                            yarn migrate; \
                            yarn seed; \
                            yarn build; \
                            pm2 restart pz-fe-api; \
                            pm2 restart pz-be-api; \
                            exit
                            EOF '''
                            }
                        }
                    }
                }
            }  
        }
        stage('QA Build') {
            when {
                branch 'qa'
            }
            steps {
                script {
                    sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
                    sh '''
                    ssh -tt -o StrictHostKeyChecking=no ubuntu@$SERVER_IP -p 22 << EOF
                    cd $CODE_DIR_NAME; \
                    sudo git pull origin qa; \
                    sudo docker build -t $ECR_URL/$REPOSITORY:$BUILD_NUMBER .; \
                    sudo aws ecr get-login-password --region us-east-2 | sudo docker login --username AWS --password-stdin $ECR_URL; \
                    sudo docker push $ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    sudo docker image prune -a -f; \
                    cd $K8S_DIR_NAME; \
                    sudo kubectl apply -f api/qa-api-backend-deployment.yml; \
                    sudo kubectl apply -f api/qa-api-frontend-deployment.yml; \
                    sudo kubectl apply -f queue/qa-queue-deployment.yml; \
                    sudo kubectl apply -f ingress/; \
                    sudo kubectl set image deployment/qa-api-frontend-deployment -n application qa-frontend-api=$ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    sudo kubectl set image deployment/qa-api-backend-deployment -n application qa-backend-api=$ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    sudo kubectl set image deployment/qa-queue-deployment -n application qa-queue=$ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    exit
                    EOF '''
                    }
                }
            }
        }
        stage('UAT Build') {
            when {
                branch 'uat'
            }
            steps {
                script {
                    sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
                    sh '''
                    ssh -tt -o StrictHostKeyChecking=no ubuntu@$SERVER_IP -p 22 << EOF
                    cd $CODE_DIR_NAME; \
                    sudo git pull origin uat; \
                    sudo docker build -t $ECR_URL/$REPOSITORY:$BUILD_NUMBER .; \
                    sudo aws ecr get-login-password --region us-east-2 | sudo docker login --username AWS --password-stdin $ECR_URL; \
                    sudo docker push $ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    sudo docker image prune -a -f; \
                    cd $K8S_DIR_NAME; \
                    sudo kubectl apply -f api/uat-api-backend-deployment.yml; \
                    sudo kubectl apply -f api/uat-api-frontend-deployment.yml; \
                    sudo kubectl apply -f queue/uat-queue-deployment.yml; \
                    sudo kubectl apply -f ingress/; \
                    sudo kubectl set image deployment/uat-api-frontend-deployment -n application uat-frontend-api=$ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    sudo kubectl set image deployment/uat-api-backend-deployment -n application uat-backend-api=$ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    sudo kubectl set image deployment/uat-queue-deployment -n application uat-queue=$ECR_URL/$REPOSITORY:$BUILD_NUMBER; \
                    exit
                    EOF '''
                    }
                }
            }
        }
    }
    post{
      success{
            notifySuccessful()
      }
      failure{
            notifyFailed()
      }
    }
}

def notifyStarted() {
mattermostSend (
  color: "#2A42EE",
  channel: 'monorepo-automation',
  endpoint: 'https://ekbana.letsperk.com/hooks/fytp14d9p3f6tntqiuk5o3oj8a',
  message: "Build STARTED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>)"
  )
}


def notifySuccessful() {
mattermostSend (
  color: "#00f514",
  channel: 'monorepo-automation',
  endpoint: 'https://ekbana.letsperk.com/hooks/fytp14d9p3f6tntqiuk5o3oj8a',
  message: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>):\n${changeLog}"
  )
}

def notifyFailed() {
mattermostSend (
  color: "#e00707",
  channel: 'monorepo-automation',
  endpoint: 'https://ekbana.letsperk.com/hooks/fytp14d9p3f6tntqiuk5o3oj8a',
  message: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>)"
  )
}
def lastSuccessfulBuild(passedBuilds, build) {
  if ((build != null) && (build.result != 'SUCCESS')) {
      passedBuilds.add(build)
      lastSuccessfulBuild(passedBuilds, build.getPreviousBuild())
   }
}

@NonCPS
def getChangeLog(passedBuilds) {
    def log = ""
    for (int x = 0; x < passedBuilds.size(); x++) {
        def currentBuild = passedBuilds[x];
        def changeLogSets = currentBuild.changeSets
        for (int i = 0; i < changeLogSets.size(); i++) {
            def entries = changeLogSets[i].items
            for (int j = 0; j < entries.length; j++) {
                def entry = entries[j]
                log += "* ${entry.msg} by ${entry.author} \n"
            }
        }
    }
    return log;
  }

def getCodeDirName(branchName) {
    if("dev".equals(branchName)) {
        return "/var/www/monorepo/dev/api/";
    } else if ("qa".equals(branchName)) {
        return "/var/www/monorepo/qa/api/";
    } else if ("uat".equals(branchName)) {
        return "/var/www/monorepo/uat/api/";
    } else {
        return "/var/www/monorepo/";
    }
}

def getK8sDirName(branchName) {
    if ("qa".equals(branchName)) {
        return "/var/www/monorepo/k8s/";
    } else if ("uat".equals(branchName)) {
        return "/var/www/monorepo/k8s/";
    } else {
        return "/var/www/monorepo";
    }
}

def getServerIp(branchName) {
    if("dev".equals(branchName)) {
        return "18.118.174.223";
    } else if("qa".equals(branchName)) {
        return "18.190.71.129";
    }
     else if("uat".equals(branchName)) {
        return "18.190.71.129";
    } else {
        return "18.118.174.223";
    }
}


def getRepositoryName(branchName) {
    if ("qa".equals(branchName)) {
        return "monorepo-qa-api-base-image";
    } else if ("uat".equals(branchName)) {
        return "monorepo-uat-api-base-image";
    } else {
        return "monorepo-live-api-base-image";
    }
}
