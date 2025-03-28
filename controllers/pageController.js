const redisClient = require('../config/redis-config');
const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');
const crypto = require('crypto');
const uploadOnCloudinary = require('../Services/cloudinaryService');
const { logError } = require('../Services/loggerService');

const homeRout = (req, res) => {
    let user = req.isAuthenticated() ? req.user : null;
    res.render('homePage', { user });
};

const profileRouter = async (req, res) => {
    try {
        const username = req.query.user;
        const regUsername = new RegExp(`^${username}$`, 'i');
        const userProfile = await userModel.findOne({ username: regUsername });
        const user = req.isAuthenticated() ? req.user : null;

        if (!userProfile) {
            return res.status(404).render('404', { user });
        }

        await redisClient.setEx(
            `user:${username}`,
            3600,
            JSON.stringify(userProfile),
        );
        res.status(200).render('profilePage', { user, userProfile });
    } catch (error) {
        logError(error.message);
    }
};

const editProfileRout = (req, res) => {
    let user = req.isAuthenticated() ? req.user : null;
    res.render('editProfile', { user });
};

const roomRout = (req, res) => {
    const roomId = crypto.randomBytes(4).toString('hex');
    const userId = req.session.passport.user;
    res.redirect(`/room/${roomId}/${userId}`);
};

const roomRoomidRout = (req, res) => {
    const userId = req.session.passport.user;

    res.redirect(`/room/${req.params.roomId}/${userId}`);
};

const roomRoomidUseridRout = (req, res) => {
    res.render('roomPage');
};

const waitingRoomsRout = async (req, res) => {
    try {
        const user = req.isAuthenticated() ? req.user : null;
        const rooms = await roomModel.find({}).lean();
        res.render('waitingRoomsPage', { user, rooms });
    } catch (error) {
        logError(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const leaderboardRout = async (req, res) => {
    try {
        const users = await userModel.find({}).sort({ coins: -1 }).limit(10);
        const user = req.isAuthenticated() ? req.user : null;
        res.render('leaderboardPage', { users, user });
    } catch (error) {
        logError(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const uploadPostRout = async (req, res) => {
    try {
        if (req.file) {
            const cloudinaryURL = await uploadOnCloudinary(
                `${req.file.destination}/${req.file.filename}`,
            );

            if (!cloudinaryURL)
                return res
                    .status(409)
                    .json({ error: 'Cloudinary upload failed' });

            const user = await userModel.findOneAndUpdate(
                { _id: req.session.passport.user },
                { profilePic: `${cloudinaryURL}`, name: req.body.name },
                { new: true },
            );
            req.user = user;
            await redisClient.del(`user:${user.username}`);
            await redisClient.setEx(
                `user:${user.username}`,
                3600,
                JSON.stringify(user),
            );
        } else {
            const user = await userModel.findOneAndUpdate(
                { _id: req.session.passport.user },
                { name: req.body.name },
                { new: true },
            );
            await redisClient.del(`user:${user.username}`);
            await redisClient.setEx(
                `user:${user.username}`,
                3600,
                JSON.stringify(user),
            );
            req.user = user;
        }

        res.redirect('/profile?user=' + req.user.username);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

const apiDocsRout = (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render('apiDocsPage', { user });
};

module.exports = {
    homeRout,
    profileRouter,
    editProfileRout,
    roomRout,
    roomRoomidRout,
    roomRoomidUseridRout,
    waitingRoomsRout,
    leaderboardRout,
    uploadPostRout,
    apiDocsRout,
};
