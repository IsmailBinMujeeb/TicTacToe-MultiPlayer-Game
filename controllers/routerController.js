const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');
const crypto = require('crypto')
const bcrypt = require('bcryptjs');

const homeRout = (req, res) => {

    let user = req.isAuthenticated() ? req.user : null;
    res.render('homePage', { user });
}

const profileRouter = async (req, res) => {
    const username = req.query.user;
    const regUsername = new RegExp(`^${username}$`, 'i');
    const userProfile = await userModel.findOne({ username: regUsername });
    const user = req.isAuthenticated() ? req.user : null;

    if (!userProfile) {
        return res.status(404).send({ message: '404 user not found.' });
    }
    res.render('profilePage', { user, userProfile });
}

const editProfileRout = (req, res) => {
    let user = req.isAuthenticated() ? req.user : null;
    res.render('editProfile', { user });
}

const roomRout = (req, res) => {
    const roomId = crypto.randomBytes(4).toString('hex');
    const userId = req.session.passport.user;
    res.redirect(`/room/${roomId}/${userId}`);
}

const room_roomidRout = (req, res) => {

    const userId = req.session.passport.user;

    res.redirect(`/room/${req.params.roomId}/${userId}`);
}

const room_roomid_useridRout = (req, res) => {

    res.render('roomPage');
}

const waitingRoomsRout = async (req, res) => {

    const user = req.isAuthenticated() ? req.user : null;
    const rooms = await roomModel.find({}).lean();
    res.render('waitingRoomsPage', { user, rooms });
}

const leaderboardRout = async (req, res)=>{
    
    const users = await userModel.find({}).sort({coins: -1}).limit(10);
    const user = req.isAuthenticated() ? req.user : null;
    res.render('leaderboardPage', { users, user });
}

const uploadPostRout = async (req, res) => {
    try {

        if (req.file) {
            const user = await userModel.findOneAndUpdate({ _id: req.session.passport.user }, { profilePic: `${req.file.destination}/${req.file.filename}`, name: req.body.name }, { new: true });
            req.user = user;
        } else {
            const user = await userModel.findOneAndUpdate({ _id: req.session.passport.user }, { name: req.body.name }, { new: true });
            req.user = user;
        }

        res.redirect('/profile?user=' + req.user.username);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

const loginRout = (req, res) => {
    let err = req.flash('error');
    res.render('loginPage', { err });
}

const regiterRout = (req, res) => {
    let err = req.flash('error');
    res.render('registerPage', { err });
}

const registerPostRout = async (req, res, next) => {

    try {
        const { name, email, username, password } = req.body;

        const regExpUsername = new RegExp(`^${username}$`, 'i');

        const userWithUsername = await userModel.findOne({ username: regExpUsername });

        if (userWithUsername) {
            req.flash("error", "Username is not available.")
            return res.redirect("/signup");
        }

        const userWithEmail = await userModel.findOne({ email });

        if (userWithEmail) {
            req.flash("error", "user with this email id is already exist.")
            return res.redirect("/signup");
        }

        bcrypt.hash(password, 10, async (err, hash) => {

            if (err) return next(err);

            const newUser = await userModel.create({

                name,
                username,
                email,
                password: hash
            })

            req.login(newUser, (err) => {
                if (err) return next(err);
                return res.redirect("/")
            })
        })
    } catch (error) {
        console.log(error)
    }
}

const logoutRout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
}

module.exports = { homeRout, profileRouter, editProfileRout, roomRout, room_roomidRout, room_roomid_useridRout, waitingRoomsRout, leaderboardRout, uploadPostRout, loginRout, regiterRout, registerPostRout, logoutRout }