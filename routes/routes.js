const router = require('express').Router();
const passport = require('passport');
const { isAuthenticated } = require('../utils/isAuthenticated');
const { homeRout, profileRouter, editProfileRout, roomRout, room_roomidRout, room_roomid_useridRout, waitingRoomsRout, leaderboardRout, uploadPostRout, loginRout, regiterRout, registerPostRout, logoutRout, apiDocsRout } = require('../controllers/routerController');
const upload = require('../middlewares/multerMiddleware');
const cachedMiddleware = require('../middlewares/cachedMiddleware');

router.get('/', homeRout);

router.get('/profile', isAuthenticated, cachedMiddleware('query'), profileRouter);

router.get('/edit-profile', isAuthenticated, editProfileRout);

router.get('/room', isAuthenticated, roomRout);

// When a user join a room he will redirect to this rout first to get the correct user id.
router.get('/room/:roomId', isAuthenticated, room_roomidRout);

router.get('/room/:roomid/:userId', room_roomid_useridRout);

router.get('/waiting-rooms', waitingRoomsRout);

router.get('/leaderboard', leaderboardRout)

router.get('/login', loginRout);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/auth/google', passport.authenticate("google", { scope: ["profile", "email"] }));

router.get( "/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
        res.redirect("/");
    }
);

router.get('/signup', regiterRout);

router.post("/signup", registerPostRout);

router.get('/logout', logoutRout);

router.post('/upload', upload.single('file'), uploadPostRout);

router.get('/api/docs', apiDocsRout);

module.exports = router;