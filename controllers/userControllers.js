const userModel = require('../models/user-model');
const bcrypt = require('bcryptjs');
const { logError } = require('../Services/loggerService');

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
        const { name, email, username, password, confirmPassword } = req.body;

        if (password != confirmPassword) {
            req.flash("error", "password and confirmed password does not match");
            return res.redirect("/signup");
        }

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
        logError(error)
    }
}

const logoutRout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
}

module.exports = { loginRout, regiterRout, registerPostRout, logoutRout }