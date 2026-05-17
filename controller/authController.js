const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// UserRegistration
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    });
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// create auth routes 
module.exports.signup_get = (req, res) => {
    res.render('signup', { title: 'Sign Up' });
}

module.exports.login_get = (req, res) => {
    res.render('login', { title: 'Login' });
}

module.exports.signup_post = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ errors: 'User with this email already exists' });
        }

        const otp = "123456"; // Static OTP for easy access
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (existingUser) {
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            existingUser.password = password; // Will be hashed again by pre-save middleware
            existingUser.name = name;
            existingUser.role = role || 'customer';
            await existingUser.save();
        } else {
            await User.create({
                name,
                email,
                password,
                role: role || 'customer',
                otp,
                otpExpires
            });
        }

        const mailOptions = {
            from: `"Capture Creation" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Capture Creation - Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4753eb; text-align: center;">Capture Creation</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Thank you for registering with Capture Creation! To complete your registration, please verify your email address using the OTP below.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="margin: 0; font-size: 32px; color: #333; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
                    <br>
                    <p style="font-size: 14px; color: #333;">Best regards,<br><strong>The Capture Creation Team</strong></p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.log("Email sending error: ", mailErr);
        }

        res.status(200).json({ redirect: `/verify-otp?email=${encodeURIComponent(email)}` });

    } catch (err) {
        console.log(err);
        res.status(400).json({ errors: 'Signup failed' });
    }
};

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);

        if (!user.isVerified) {
            const otp = "123456"; // Static OTP for easy access
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            const mailOptions = {
                from: `"Capture Creation" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Login to Capture Creation - Your Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #4753eb; text-align: center;">Capture Creation</h2>
                        <p style="font-size: 16px; color: #333;">Hello,</p>
                        <p style="font-size: 16px; color: #333;">Please verify your email address using the OTP below to login to your account.</p>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <h1 style="margin: 0; font-size: 32px; color: #333; letter-spacing: 5px;">${otp}</h1>
                        </div>
                        <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
                        <br>
                        <p style="font-size: 14px; color: #333;">Best regards,<br><strong>The Capture Creation Team</strong></p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (mailErr) {
                console.log("Email sending error: ", mailErr);
            }

            return res.status(200).json({ redirect: `/verify-otp?email=${encodeURIComponent(email)}` });
        }

        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).json({ user: user._id, redirect: user.role === 'photographer' ? '/admin/dashboard' : '/' });

    } catch (err) {
        console.log(err);
        res.status(400).json({ errors: 'Login failed' });
    }
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};

module.exports.verify_otp_get = (req, res) => {
    res.render('verify-otp', { title: 'Verify OTP', email: req.query.email });
};

module.exports.verify_otp_post = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ errors: 'User not found' });

        if (user.otp !== otp) {
            return res.status(400).json({ errors: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ errors: 'OTP has expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).json({ user: user._id, redirect: user.role === 'photographer' ? '/admin/dashboard' : '/' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ errors: 'OTP Verification failed' });
    }
};
