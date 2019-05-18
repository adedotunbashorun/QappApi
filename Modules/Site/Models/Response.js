'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ResponseSchema = new Schema({
    data: { type: String },
}, { timestamps: true })


module.exports = mongoose.model('Response', ResponseSchema)