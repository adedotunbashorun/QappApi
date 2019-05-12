'use strict'

const User = require('../Models/User')
const UserSeeder = {}
const crypto = require('crypto')
const Activity = require('../../../functions/activity')

UserSeeder.seedUser = (req, res) => {
    try {
        // use the User model to insert/save
        var user = new User()
        user.title = "Mr"
        user.user_type = 'admin'
        user.first_name = 'Dev'
        user.last_name = 'Admin'
        user.email = 'adedotunolawale@gmail.com'
        user.temporarytoken = null
        user.password = User.hashPassword('123456')
        user.is_active = true
        user.save()

        // seeded!
        return res.status(201).json({ msg: 'User Seeded', user: user })
    } catch (err) {
        return res.status(422).json({ error: err, msg: err.message })
    }
}

module.exports = UserSeeder