const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 25,
  auth: {
    user: 'mohsinahmad@kpmg.com',
    pass: ''
  }
});

module.exports = transporter;
