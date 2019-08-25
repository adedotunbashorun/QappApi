'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const uniqueValidator = require('mongoose-unique-validator')

const UserSchema = new Schema({
    user_type: { type: String, lowercase: true, default: 'user' },
    title: { type: String, required: true },
    medium: { type: String, default: null },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    phone: { type: String, default: '' },
    profile_image: { type: String, default: ''},
    address: { type: String, default: '' },
    email: {
        type: String,
        lowercase: true,
        required: true,
        validate: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        index: { unique: true, dropDups: true }

    },
    password: { type: String, required: true },
    is_active: { type: Boolean, required: true, default: false },
    temporarytoken: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    is_scheduled: { type: Boolean, default: false },
    reset_password: { type: Boolean, default: false }
}, { timestamps: true }, { toJSON: { virtuals: true } })

UserSchema.virtual('schedules', {
    ref: 'Schedule',
    localField: '_id',
    foreignField: 'user_id',
    justOne: false // set true for one-to-one relationship
})

UserSchema.statics.hashPassword = function hashPassword(password) {
    return bcrypt.hashSync(password, 10)
}

UserSchema.methods.isValid = function (hashedPassword) {
    return bcrypt.compareSync(hashedPassword, this.password)
}

UserSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', UserSchema)