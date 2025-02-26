const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');

const userModel = require('../models/user-model');

const { logError } = require('../Services/loggerService');

module.exports = (passport) => {

    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const regExpUsername = new RegExp(`^${username}$`, 'i');

            const user = await userModel.findOne({ username: regExpUsername });

            if (!user) {
                return done(null, false, { message: "Incorrect Username or Password" });
            }

            if (!user.password) {
                return done(null, false, { message: "Login with Google" })
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {

                if (err) return done(err);

                if (!isMatch) return done(null, false, { message: "Incorrect Username or Password" });

                return done(null, user);
            })
        } catch (error) {
            logError(error)
        }
    }));

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                const user = await userModel.findOneAndUpdate({ profileId: profile.id }, {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.emails[0].value.split('@')[0],
                }, { new: true, upsert: true });

                done(null, user)
            } catch (error) {
                logError(error)
                done(error, false)
            }
        }
    ))

    passport.serializeUser((user, done) => {

        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {

        const user = await userModel.findOne({ _id: id });

        done(null, user);
    })
}