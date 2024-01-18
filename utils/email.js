const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Syed Faheem <${process.env.Email}>`;
    this.url = url;
    this.firstName = user.name.slipt(' ')[0];
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Use Sendgrid
      return 1;
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
      from: this.from,
      url: this.url,
      subject,
    });

    //Define the mail options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //Send email
    await this.newTransport().sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }
}

module.exports = Email;
