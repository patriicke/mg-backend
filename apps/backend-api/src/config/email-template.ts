interface EmailTemplateData {
  title: string;
  code: string;
  sender: string;
  subject: string;
  target: string;
  body: string;
  isDefault: boolean;
}

const templates: Array<EmailTemplateData> = [
  {
    title: 'Two Factor Authentication',
    code: 'two-factor-authentication',
    sender: 'noreply@avalon.com',
    subject: 'Activate Two Factor Authentication',
    target: 'CMS',
    isDefault: true,
    body: `<div style="margin: 0px; background-color: #f2f3f8;"><!--100% body table-->
      <table style="@import url(https: //fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;" border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f2f3f8">
      <tbody>
      <tr>
      <td>
      <table style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
      <tbody>
      <tr>
      <td style="height: 80px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="height: 20px;">&nbsp;</td>
      </tr>
      <tr>
      <td>
      <table style="max-width: 670px; background: #fff; border-radius: 3px; text-align: center; -webkit-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); -moz-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); box-shadow: 0 6px 18px 0 rgba(0,0,0,.06);" border="0" width="95%" cellspacing="0" cellpadding="0" align="center">
      <tbody>
      <tr>
      <td style="height: 40px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="padding: 0 35px;">
      <h1 style="color: #1e1e2d; font-weight: 500; margin: 0; font-size: 32px; font-family: 'Rubik',sans-serif;">Please enable two factor authentication.</h1>
      <p style="color: #455056; font-size: 15px; line-height: 24px; margin: 0;">To configure authentication via TOTP on multiple devices, during setup, scan the QR code using each device at the same time.</p>
      <p><img id="qr-code-otp" src="{{qrcode}}" alt="QR code OTP"></p>
      <p style="text-align: start; color: #455056; font-size: 15px; line-height: 24px; margin: 0;">A time-based one-time password (TOTP) application automatically generates an authentication code that changes after a certain period of time. We recommend using cloud-based TOTP apps such as:</p>
      <ul style="text-align: start;">
      <li><a href="https://support.1password.com/one-time-passwords/" target="_self">1Password</a></li>
      <li><a href="https://authy.com/guides/github/" target="_self">Authy</a></li>
      <li><a href="https://lastpass.com/auth/" target="_self">LastPass Authenticator</a></li>
      <li><a href="https://www.microsoft.com/en-us/account/authenticator/" target="_self">Microsoft Authenticator</a></li>
      <li><a href="https://docs.keeper.io/enterprise-guide/storing-two-factor-codes" target="_self">Keeper</a></li>
      </ul>
      <p>If you haven't requested the code please ignore the email.</p>
      </td>
      </tr>
      <tr>
      <td style="height: 40px;">&nbsp;</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      <tr>
      <td style="height: 20px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="height: 80px;">&nbsp;</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <!--/100% body table--></div>`
  },
  {
    title: 'Reset Password',
    code: 'reset-password',
    sender: 'noreply@app.com',
    subject: 'Reset Password',
    target: 'CMS',
    isDefault: true,
    body: `<div style="margin: 0px; background-color: #f2f3f8;"><!--100% body table-->
    <table style="@import url(https: //fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;" border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f2f3f8">
    <tbody>
    <tr>
    <td>
    <table style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr>
    <td style="height: 80px;">&nbsp;</td>
    </tr>
    <tr>
    <td style="height: 20px;">&nbsp;</td>
    </tr>
    <tr>
    <td>
    <table style="max-width: 670px; background: #fff; border-radius: 3px; text-align: center; -webkit-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); -moz-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); box-shadow: 0 6px 18px 0 rgba(0,0,0,.06);" border="0" width="95%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr>
    <td style="height: 40px;">&nbsp;</td>
    </tr>
    <tr>
    <td style="padding: 0 35px;">
    <h1 style="color: #1e1e2d; font-weight: 500; margin: 0; font-size: 32px; font-family: 'Rubik',sans-serif;">You have requested to reset your password</h1>
    <p style="color: #455056; font-size: 15px; line-height: 24px; margin: 0;">We cannot simply send you your old password. A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.</p>
    <a style="background: #20e277 !important; text-decoration: none !important; font-weight: 500; margin-top: 35px; color: #fff; text-transform: uppercase; font-size: 14px; padding: 10px 24px; display: inline-block; border-radius: 50px;" href="{{passwordSetLink}}">{{linkLabel}}</a></td>
    </tr>
    <tr>
    <td style="height: 40px;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    <tr>
    <td style="height: 20px;">&nbsp;</td>
    </tr>
    <tr>
    <td style="height: 80px;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--/100% body table--></div>`
  },
  {
    title: 'New User Set Password',
    code: 'new-user-set-password',
    sender: 'noreply@app.com',
    subject: 'Set Password',
    target: 'CMS',
    isDefault: true,
    body: `<div style="margin: 0px; background-color: #f2f3f8;"><!--100% body table-->
      <table style="@import url(https: //fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;" border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f2f3f8">
      <tbody>
      <tr>
      <td>
      <table style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
      <tbody>
      <tr>
      <td style="height: 80px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="height: 20px;">&nbsp;</td>
      </tr>
      <tr>
      <td>
      <table style="max-width: 670px; background: #fff; border-radius: 3px; text-align: center; -webkit-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); -moz-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); box-shadow: 0 6px 18px 0 rgba(0,0,0,.06);" border="0" width="95%" cellspacing="0" cellpadding="0" align="center">
      <tbody>
      <tr>
      <td style="height: 40px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="padding: 0 35px;">
      <h1 style="color: #1e1e2d; font-weight: 500; margin: 0; font-size: 32px; font-family: 'Rubik',sans-serif;">A new account has been created using your email.</h1>
      <p style="color: #455056; font-size: 15px; line-height: 24px; margin: 0;">Please use the following link to set a password for your account. Please note this link is only valid for the next hour.</p>
      <a style="background: #20e277 !important; text-decoration: none !important; font-weight: 500; margin-top: 35px; color: #fff; text-transform: uppercase; font-size: 14px; padding: 10px 24px; display: inline-block; border-radius: 50px;" href="{{passwordSetLink}}">{{linkLabel}}</a></td>
      </tr>
      <tr>
      <td style="height: 40px;">&nbsp;</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      <tr>
      <td style="height: 20px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="height: 80px;">&nbsp;</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <!--/100% body table--></div>`
  },
  {
    title: 'Registration Verification',
    code: 'registration-verification',
    sender: 'noreply@app.com',
    subject: 'Registration Verification',
    target: 'Frontend',
    isDefault: true,
    body: `<div style="margin: 0px; background-color: #f2f3f8;"><!--100% body table-->
      <table style="@import url(https: //fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;" border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f2f3f8">
      <tbody>
      <tr>
      <td>
      <table style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
      <tbody>
      <tr>
      <td style="height: 80px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="height: 20px;">&nbsp;</td>
      </tr>
      <tr>
      <td>
      <table style="max-width: 670px; background: #fff; border-radius: 3px; text-align: center; -webkit-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); -moz-box-shadow: 0 6px 18px 0 rgba(0,0,0,.06); box-shadow: 0 6px 18px 0 rgba(0,0,0,.06);" border="0" width="95%" cellspacing="0" cellpadding="0" align="center">
      <tbody>
      <tr>
      <td style="height: 40px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="padding: 0 35px;">
      <h1 style="color: #1e1e2d; font-weight: 500; margin: 0; font-size: 32px; font-family: 'Rubik',sans-serif;">A new account has been created using your email.</h1>
      <p style="color: #455056; font-size: 15px; line-height: 24px; margin: 0;">Please use this {{token}} token to verify your email. Please note this token is only valid for 24 hour.</p>
      </tr>
      <tr>
      <td style="height: 40px;">&nbsp;</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      <tr>
      <td style="height: 20px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="height: 80px;">&nbsp;</td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <!--/100% body table--></div>`
  }
];

export = templates;
