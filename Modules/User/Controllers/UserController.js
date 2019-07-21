'use strict'

const Activity = require('../../../functions/activity')
const Schedule = require('../../Site/Models/Schedule')
const Response = require('../../Site/Models/Response')
const File = require('../../../functions/file')
const User = require('../Models/User')

class UserController {    

    static update(req, res, next) {
        try {
            User.findById(req.params.id, function (error, user) {
                if (error) {
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    user.title = req.body.title
                    user.first_name = req.body.first_name
                    user.last_name = req.body.last_name
                    user.email = req.body.email
                    user.username = req.body.username
                    user.city = req.body.city
                    user.medium = req.body.medium
                    user.country = req.body.country
                    user.phone = req.body.phone
                    user.postal_code = req.body.postal_code
                    user.address = req.body.address
                    user.save(function (error) {
                        if (error) {
                            Activity.activity_log(req, user._id, 'Error Updating Profile!')
                            (req.user) ? Activity.activity_log(req, req.user._id, 'Error Updating User') : ''
                            return res.json({ error: error, msg: error.message })
                        } else {
                            Activity.Email(user, 'Profile Update', Activity.html('<p style="color: #000">Hello ' + user.first_name + ' ' + user.last_name + ', Your profile has been updated succesfully.</p>'))
                            Activity.activity_log(req, user._id, 'Profile Updated Successfully')
                            // (req.user) ? Activity.activity_log(req, req.user, 'Updated User') : ''
                            return res.status(201).json({
                                'user': user,
                                'msg': user.first_name +
                                    ' Profile Updated Successfully!'
                            })
                        }
                    })
                }

            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static getAll(req, res, next) {
        try {
            User.find({ deleted_at: null }, null, { sort: { 'createdAt': -1 } }, function (error, users) {
                if (error) return res.json(error)
                (req.user) ? Activity.activity_log(req, req.user._id, 'View All Users') : ''
                return res.json({ users: users })
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static getAllSchedule(req, res, next) {
        try {
            User.find({ deleted_at: null }).sort('createdAt').populate('schedules').then((users) => {                
                // (req.user) ? Activity.activity_log(req, req.user._id, 'View All Users') : ''
                return res.json({ users: users })
            }).catch(error =>{
                if (error) return res.json(error)
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static getOne(req, res, next) {
        try {
            User.findOne({ _id: req.params.id, deleted_at: null }, function (error, user) {
                if (error) {
                    (req.user) ? Activity.activity_log(req, req.user._id, 'View a user record') : ''
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    return res.status(201).json({ user: user })
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static forgetPassword(req, res, next) {
        try {
            User.findOne({ email: req.body.email, deleted_at: null }, function (error, user) {
                if (error) {
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    if (user) {
                        var pword = Activity.makeid(6)
                        user.password = User.hashPassword(pword)
                        user.reset_password =  true
                        Activity.Email(user, 'Forget Password', Activity.html('<p style="color: #000">Hello ' + user.first_name + ' ' + user.last_name + ' This is your new default password.<br><span style="color: #1D4BB7">' + pword + '</span><br/>kindly log on to the application to set a new one.</p>'))
                        user.save()
                        Activity.activity_log(req, user._id, 'user reset password') 
                        return res.status(201).json({ msg: "A mail has been sent to you." })
                    } else {
                        return res.status(501).json({ msg: 'user not found.' })
                    }
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static resetPassword(req, res, next) {
        try {
            User.findOne({ _id: req.params.id, deleted_at: null }, function (error, user) {
                if (error) {
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    if (user.isValid(req.body.old_password)) {
                        user.password = User.hashPassword(req.body.password)
                        user.reset_password =  false
                        Activity.Email(user, 'Reset Password', Activity.html('<p style="color: #000">Hello ' + user.first_name + ' ' + user.last_name + ',You have successfully reset your password,<br>Thank you.</p>'))
                        user.save()
                        Activity.activity_log(req, user._id, 'reset password')
                        return res.status(201).json({ msg: "password reset successfully.", user : user})
                    } else {
                        return res.status(501).json({ msg: "your old password is incorrect, please check your old password." })
                    }
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static delete(req, res, next) {
        try {
            User.findOneAndRemove({ _id: req.params.id, deleted_at: null }, function (error, user) {
                if (error) {
                    (req.user) ? Activity.activity_log(req, req.user._id, 'error deleting a user') : ''
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    if(user){
                        Schedule.find({ user_id: req.params.id}).remove().exec()
                        Response.find({ user_id: req.params.id }).remove().exec()
                    }                                     
                    (req.user) ? Activity.activity_log(req, req.user._id, 'deleted a user') : ''
                    return res.json({ msg:"user was deleted successfully" })
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static profileImage(req,res,next){
        try {
            User.findById(req.params.id, function (error, user) {
                if (error) {
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    user.profile_image = (req.body.image) ? File.Image(req.body.image, user.username) : ''
                    user.save()
                    return res.status(201).json({ user: user })
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

}

module.exports = UserController