const router = require('express').Router();
const cachedMiddleware = require('../middlewares/cachedMiddleware');
const {
    usersApiRout,
    leaderboardApiRout,
    waitingRoomsApiRout,
} = require('../controllers/apiCountrollers');

router.get('/api/users/:user', cachedMiddleware('params'), usersApiRout);
router.get('/api/leaderboard', leaderboardApiRout);
router.get('/api/waiting-rooms', waitingRoomsApiRout);

module.exports = router;
