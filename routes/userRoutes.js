const router = require('express').Router();
const passport = require('passport');
const {
    loginRout,
    regiterRout,
    registerPostRout,
    logoutRout,
} = require('../controllers/userControllers');

router.get('/login', loginRout);

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    }),
);

router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    },
);

router.get('/signup', regiterRout);

router.post('/signup', registerPostRout);

router.get('/logout', logoutRout);

module.exports = router;
