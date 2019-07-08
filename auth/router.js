'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();


const createAuthToken = function(user) {
    console.log(`------------ user rtr 12: `, user)
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT.EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

router.post('/login', localAuth, (req,res) => {
    console.log(`------------------------ /login post router request --------------`)
    const authToken = createAuthtoken(req.user.serialize());
    res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req,res) => {
    const authToken = createAuthToken(req.user);
    res.json({authToken});
});

module.exports = {router};