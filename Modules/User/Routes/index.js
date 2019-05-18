'use strict'

const express = require('express')
const router = express.Router()
const Guard = require('../../../Middleware/auth')
const UserController = require('../Controllers/UserController')
const User = require('../Seeders/UserSeeder')

router.patch('/user/update/:id', [Guard.isValidUser], (req, res, next) => {
    UserController.update(req, res, next)
})

router.get('/user/schedule', (req, res, next) => {
    UserController.getAllSchedule(req, res)
})

router.get('/users', [Guard.isValidUser], (req, res, next) => {
    UserController.getAll(req, res, next)
})

router.get('/user', [Guard.isValidUser], (req, res, next) => {
    return res.status(200).json(req.user)
})

router.get('/user/:id', [Guard.isValidUser], (req, res, next) => {
    UserController.getOne(req, res, next)
})

router.delete('/user/:id', [Guard.isValidUser], (req, res, next) => {
    UserController.delete(req, res, next)
})

router.post('/forget_password', (req, res, next) => {
    UserController.forgetPassword(req, res, next)
})

router.post('/reset_password/:id', (req, res, next) => {
    UserController.resetPassword(req, res, next)
})

router.get('/users/deleted', [Guard.isValidUser], (req, res, next) => {
    UserController.deletedUser(req, res, next)
})

router.patch('/user/restore/:id', [Guard.isValidUser], (req, res, next) => {
    UserController.restoreOne(req, res, next)
})

router.get('/seed/user', (req, res, next) => {
    User.seedUser(req, res)
})



module.exports = router