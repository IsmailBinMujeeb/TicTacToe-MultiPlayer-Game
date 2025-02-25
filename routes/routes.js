const router = require('express').Router();
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { homeRout, profileRouter, editProfileRout, roomRout, roomRoomidRout, roomRoomidUseridRout, waitingRoomsRout, leaderboardRout, uploadPostRout, apiDocsRout } = require('../controllers/pageController');
const upload = require('../middlewares/multerMiddleware');
const cachedMiddleware = require('../middlewares/cachedMiddleware');

router.get('/', homeRout);

router.get('/profile', isAuthenticated, cachedMiddleware('query'), profileRouter);

router.get('/edit-profile', isAuthenticated, editProfileRout);

router.get('/room', isAuthenticated, roomRout);

// When a user join a room he will redirect to this rout first to get the correct user id.
router.get('/room/:roomId', isAuthenticated, roomRoomidRout);

router.get('/room/:roomid/:userId', roomRoomidUseridRout);

router.get('/waiting-rooms', waitingRoomsRout);

router.get('/leaderboard', leaderboardRout)

router.post('/upload', upload.single('file'), uploadPostRout);

router.get('/api/docs', apiDocsRout);

module.exports = router;