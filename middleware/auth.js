module.exports = function (req, res, next) {
    if (!req.session.isAuthenticeted) {
        return res.redirect('/auth/login');
    }

    next();
};