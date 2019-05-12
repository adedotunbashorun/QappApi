'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    email: {
        type: String,
        required: true,
        index: { unique: true, dropDups: true }
    },
    ip_address: {
        type: String,
        required: true
    },
    status:{
        type: Number,
        default: 1
    }
}, { timestamps: true })

module.exports = mongoose.model('EmailAlert', schema)