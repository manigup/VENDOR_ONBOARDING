const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 25,
  secure: true,
  auth: {
    user: 'suppliersupport@impauto.com',
    pass: 'P0rR@l$#35'
  }
});

module.exports = transporter;
