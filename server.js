const express = require("express");
const passport = require("passport")
const path = require("path");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
require('dotenv').config()

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        callbackURL: "http://localhost:30788/auth/google/callback",
        passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const createServer = () => {
    const app = express();
    
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "html")));
    app.use(session({
        secret: 'keyboardcat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/auth/google/callback", passport.authenticate("google", 
        { failureRedirect: "/", successRedirect: "/profile" }), 
        (req, res) => {
            res.redirect("/");
        });
    app.get('/', (req, res) => {
        if ( !req.user ) 
            res.sendFile(path.join(__dirname, "html", "index.html"));
        else 
            res.redirect("/profile")
    });
    app.get('/auth/google/failure', (req, res) => {
        res.send( "Failed to authenticate..")
    })

    app.use((req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect("/");
        }
    });

    app.get("/profile", (req, res) => {
        const { displayName, email } = req.user
        res.send( `Hello ${displayName}! Your email is ${email}`);
    });

    return app;
}

module.exports = createServer;