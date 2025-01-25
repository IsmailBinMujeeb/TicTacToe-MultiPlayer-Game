const express = require('express');
const session = require('express-session');
const conn = require('./config/db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash')
const path = require('path');
require('dotenv').config();

const userModel = require('./models/user-model');
const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 9000000000000 },
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done)=>{
    try {
        const regExpUsername = new RegExp(`^${username}$`, 'i');
        
        const user = await userModel.findOne({ username: regExpUsername });

        if (!user) {
            return done(null, false, { message: "Incorrect Username or Password" });
        }

        if (!user.password) {
            return done(null, false, { message: "Login with Google"})
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {

            if (err) return done(err);

            if (!isMatch) return done(null, false, { message: "Incorrect Username or Password" });

            return done(null, user);
        })
    } catch (error) {
        console.log(error)
    }
}));

passport.serializeUser((user, done) => {

    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {

    const user = await userModel.findOne({ _id: id });

    done(null, user);
})

app.use('/', routes);

app.listen(PORT, ()=>{console.log(`Running at http://localhost:3000`)});