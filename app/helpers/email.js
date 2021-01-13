const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const User = require('../models/user');

exports.sendEmail = async (email) => {
    var token = crypto.randomBytes(20);
    let activeToken = token.toString('hex');
    let activeExpires = Date.now() + 24 * 3600 * 1000;
    let link = `http://localhost:3000/api/admin/active/${activeToken}`;
    await User.query().where({ email: email }).update({ active_token: activeToken });
    await User.query().where({ email: email }).update({ active_expire: activeExpires });


    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'bobbiphong@gmail.com',
            pass: process.env.emailpass
        }
    });

    let mailOptions = {
        from: 'bobbiphong@gmail.com',
        to: email,
        subject: 'Active admin',
        text: `Please click <a href="${link}" here </a> to activate your account, activation link will expired within 24 hours. `
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error.message);
        }
        console.log('success');
    });
};
