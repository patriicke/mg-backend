export interface MailJobInterface {
  to: string;
  code: string;
  subject: string;
  context: any;
  attachments?: any;
}
