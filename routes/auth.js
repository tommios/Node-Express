const { Router } = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const sgMail = require('@sendgrid/mail');
const sgTransport = require('nodemailer-sendgrid-transport');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const User = require('../models/user');

const router = Router();

const transport = nodemailer.createTransport(
    sgTransport({
        auth: {
            api_key: keys.SENDGRID_API_KEY02
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

            transport.sendMail(
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

module.exports = router;