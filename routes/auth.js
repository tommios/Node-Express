const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const sgMail = require('@sendgrid/mail');
const sgTransport = require('nodemailer-sendgrid-transport');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const User = require('../models/user');

const router = Router();

const transport = nodemailer.createTransport(
    sgTransport({
        auth: {
            api_key: keys.SENDGRID_API_KEY
        }
    }));

router.get('/login', async (req, res) => {

    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    })

});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const candidate = await User.findOne({ email });
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);
            if (areSame) {
                const user = candidate;
                req.session.user = user;
                req.session.isAuthenticeted = true;

                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');
                })
            }
            else {
                req.flash('loginError', 'Неверный пароль');
                res.redirect('/auth/login#login');
            }
        }
        else {
            req.flash('loginError', 'Такого пользователя не существует');
            res.redirect('/auth/login#login');
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, repeat, name } = req.body;

        const candidate = await User.findOne({ email });
        if (candidate) {
            req.flash('registerError', 'Пользователь с таким email уже существует');
            res.redirect('/auth/login#register');
        }
        else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({
                email,
                name,
                password: hashPassword,
                cart: {
                    items: []
                }
            });

            await user.save();

            await transport.sendMail(
                regEmail(email),
                function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.respons);
                    }
                });

            res.redirect('/auth/login#login');
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error')
    });
});

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/auth/login');
        }
        else {
            res.render('auth/password', {
                title: 'Восстановление доступа',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что то пошло не так, повторите попытку позже');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({ email: req.body.email });

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; // Время жизни токена 1 час
                await candidate.save();
                await transport.sendMail(resetEmail(candidate.email, token));
                res.redirect('/auth/login');
            }
            else {
                req.flash('error', 'Пользователя с таким email не существует');
                res.redirect('/auth/reset');
            }
        });
    }
    catch (err) {
        console.log(err);
    }
})

module.exports = router;