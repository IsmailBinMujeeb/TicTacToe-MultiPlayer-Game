const userModel = require('../models/user-model');
const bcrypt = require('bcryptjs')

const homeRout = (req, res) => {

    let user = req.isAuthenticated() ? req.user : null;
    res.render('homePage', { user });
}

const profileRouter = (req, res)=>{
    let user = req.isAuthenticated() ? req.user : null;
    res.render('profilePage', {user});
}

const editProfileRout = (req, res)=>{
    let user = req.isAuthenticated() ? req.user : null;
    res.render('editProfile', {user});
}

const uploadPostRout = async (req, res) => {
    try {
        const user = await userModel.findOneAndUpdate({ _id: req.session.passport.user }, { profilePic: `${req.file.destination}/${req.file.filename}` }, { new: true });
        req.user = user;
        res.redirect('/profile');
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
        const { fullname, email, username, password } = req.body;

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

                fullname,
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

module.exports = { homeRout, profileRouter, editProfileRout, uploadPostRout, loginRout, regiterRout, registerPostRout, logoutRout }