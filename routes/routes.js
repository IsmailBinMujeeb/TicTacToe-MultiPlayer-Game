const router = require('express').Router();
const passport = require('passport');
const {isAuthenticated} = require('../utils/isAuthenticated');
const { homeRout, profileRouter, editProfileRout, uploadPostRout, loginRout, regiterRout, registerPostRout, logoutRout } = require('../controllers/routerController');
const upload = require('../middlewares/multerMiddleware');
const userModel = require('../models/user-model')

router.get('/', homeRout);

router.get('/profile', isAuthenticated, profileRouter);

router.get('/edit-profile', isAuthenticated, editProfileRout);

router.get('/login', loginRout);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/signup', regiterRout);

router.post("/signup", registerPostRout);

router.get('/logout', logoutRout);

router.post('/upload', upload.single('file'), uploadPostRout);

module.exports = router;