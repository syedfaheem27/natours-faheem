const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    // this.from = `Syed Faheem <${process.env.Email_FROM}>`;
    this.from = process.env.EMAIL_FROM;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Use SendinBlue
      return nodemailer.createTransport({
        service: 'SendinBlue',

        // host: process.env.SENDINBLUE_HOST,
        // port: process.env.SENDINBLUE_PORT,

        auth: {
          user: process.env.SENDINBLUE_USERNAME,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //Generate HTML based on a template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //Define the mail options
    const emailOptions = {
      // from: this.from,
      from: 'faheem@test.io',
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    //Send email
    await this.newTransport().sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendResetPassword() {
    await this.send(
      'forgotPassword',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}

module.exports = Email;
