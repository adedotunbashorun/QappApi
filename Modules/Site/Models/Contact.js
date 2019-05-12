'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ContactSchema = new Schema({
    full_name: { type: String, required: true },
    phone: { type: String, default: null },
    email: {
        type: String,
        lowercase: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    message: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Contact', ContactSchema)