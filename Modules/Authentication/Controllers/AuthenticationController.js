'use strict'

const passport = require('passport')
const crypto = require('crypto')
const User = require('../../User/Models/User')
const Activity = require('../../../functions/activity')
const jwt = require('jsonwebtoken')
var token

class AuthenticationController{

    static register(req, res, next) {
        try {
            if (typeof req.body.password === 'undefined' || req.body.password == "")
                return res.status(501).json({ error: "password is required" })
            let user = new User()
            user.title = req.body.title
            user.user_type = (req.body.user_type) ? req.body.user_type : 'user'
            user.first_name = (req.body.first_name) ? req.body.first_name : ''
            user.last_name = req.body.last_name
            user.medium = req.body.medium
            user.phone = req.body.phone
            user.email = req.body.email
            user.password = User.hashPassword(req.body.password)
            user.temporarytoken = crypto.randomBytes(20).toString('hex')
             user.save(function (error) {
                if (error) {
                    return res.json({ error: error, msg: error.message })
                } else {
                    Activity.Email(user, 'New Registration', Activity.html('<p style="color: #000">Hello ' + user.first_name + ' ' + user.last_name + ', Thank you for registering at Qapp Map.<br> Please click the link below to complete registration https://qapp.herokuapp.com/#/activate/' + user.temporarytoken + '</p>'))
                    Activity.activity_log(req, user._id, 'Registered')
                    // (req.user) ? Activity.activity_log(req, req.user._id, 'Register a user') : ''
                    return res.status(201).json({ user: user, msg: 'Registration Successful.' })
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static Activate(req, res, next) {
        User.findOne({ temporarytoken: req.params.token }).then((user) => {
            if (!user) {
                res.json({ 'msg': 'token do not math' });
            } else {
                user.temporarytoken = null;
                user.is_active = true;
                Activity.Email(user, 'Account Activated', Activity.html('<p style="color: #000">Hello ' + user.first_name + ' ' + user.last_name + ', Thank you for registering at Brax Map. Your Account has been activated successfully.'));
                //getting mail data
                user.save();
                Activity.activity_log(req, user._id, 'Activated is Account')
                return res.status(201).json(user);
            }

        }).catch((err)=>{
            return res.status(401).json(err);
        })
    }

    static login(req, res, next) {
        passport.authenticate('local', { session: false }, function (err, user, info) {
            if (err) { return res.status(501).json(err) }
            if (!user) { return res.status(404).json(info) }
            req.logIn(user, { session: false }, function (err) {
                if (err) { return res.status(401).json({ error: error, msg: error.message }) }
                if (user.temporarytoken == null || user.temporarytoken == "false") {
                    token = jwt.sign({ id: user._id, email: user.email }, 'BraxMap', { expiresIn: '24h' })
                    User.findOneAndUpdate({ email: user.email }, { $set: { temporarytoken: token } }, { upsert: true, returnNewDocument: true }).then(function (user) {
                        if (user != null) next()
                    })
                    Activity.activity_log(req, user._id, 'LoggedIn')
                    return res.status(201).json({ 'msg': 'Login Successful!', token: token, user: user })
                }
                Activity.activity_log(req, user._id, 'LoggedIn')
                return res.status(201).json({ 'msg': 'Login Successful!', token: user.temporarytoken, user: user })
            })
        })(req, res, next)
    }

    static logout(req, res, next) {
        User.findOne({ temporarytoken: req.headers.authorization }).then((user) => {
            if (user) {
                user.temporarytoken = null;
                 user.save();

                Activity.activity_log(req, user._id, 'Logged Out')
            }
            return res.status(201).json({
                'msg': 'Logout Successfull!',
                token: null
            });
        }).catch((err) => {
            return res.status(401).json({
                'msg': 'Unable to logout'
            });
        })
        
    }
}

module.exports = AuthenticationController