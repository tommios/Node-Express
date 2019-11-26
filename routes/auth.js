const { Router } = require('express');
const User = require('../models/user');

const router = Router();

router.get('/login', async (req, res) => {

    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    })

});

router.post('/login', async (req, res) => {
    const user = await User.findById('5dd689ce085ead5d4077fa4f');
    req.session.user = user;
    req.session.isAuthenticeted = true;

    req.session.save(err => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    })
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, repeat, name } = req.body;

        const candidate = await User.findOne({ email });
        if (candidate) {
            res.redirect('/auth/login#register');
        }
        else {
            const user = new User({
                email,
                name,
                password,
                cart: {
                    items: []
                }
            });
            await user.save();
            res.redirect('/auth/login#login');
        }
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;