'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    user_id: { type: Schema.ObjectId, ref: 'User', default: null },
    description: {
        type: String,
        required: true
    },
    ip_address: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('ActivityLog', schema)