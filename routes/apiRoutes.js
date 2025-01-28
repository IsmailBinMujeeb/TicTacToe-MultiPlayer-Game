const router = require('express').Router();
const { usersApiRout, leaderboardApiRout, waitingRoomsApiRout } = require('../controllers/apiCountrollers');

router.get('/api/users/:username', usersApiRout);
router.get('/api/leaderboard', leaderboardApiRout);
router.get('/api/rooms', waitingRoomsApiRout);

module.exports = router;