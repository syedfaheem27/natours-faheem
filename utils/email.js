const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

class Email {
  static instance = null;

  constructor() {
    if (Email.instance === null) Email.instance = this;

    return Email.instance;
  }
  getTransporter() {
    if (process.env.NODE_ENV === "development")
      this.options = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      };

    if (process.env.NODE_ENV === "production")
      this.options = {
        host: process.env.EMAIL_PROD_HOST,
        port: process.env.EMAIL_PROD_PORT,
        auth: {
          user: process.env.EMAIL_PROD_USERNAME,
          pass: process.env.EMAIL_PROD_PASSWORD,
        },
      };

    return nodemailer.createTransport(this.options);
  }

  async sendMail(mailOptions) {
    await this.getTransporter().sendMail(mailOptions);
  }

  async sendWelcome(templateStr, subject, user, url) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/${templateStr}.pug`,
      {
        subject,
        firstName: `${user.name.split(" ")[0]}`,
        url,
      },
    );

    const options = {
      wordwrap: 130,
    };
    const text = convert(html, options);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject,
      text,
      html,
    };

    await this.sendMail(mailOptions);
  }

  async sendResetPassword(templateStr, subject, user, url) {
    const html = pug.renderFile(
      `${__dirname}/../views/email/${templateStr}.pug`,
      {
        subject,
        firstName: `${user.name.split(" ")[0]}`,
        url,
      },
    );

    const options = {
      wordwrap: 130,
    };

    const text = convert(html, options);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject,
      text,
      html,
    };

    await this.sendMail(mailOptions);
  }
}
module.exports = new Email();
