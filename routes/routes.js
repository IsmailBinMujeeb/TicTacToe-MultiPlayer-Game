const router = require('express').Router();
const passport = require('passport');
const {isAuthenticated} = require('../utils/isAuthenticated');
const { homeRout, loginRout, regiterRout, registerPostRout, logoutRout } = require('../controllers/routerController');

router.get('/', homeRout);

router.get('/login', loginRout);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/signup', regiterRout);

router.post("/signup", registerPostRout);

router.get('/logout', logoutRout);

module.exports = router;