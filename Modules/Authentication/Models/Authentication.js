'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AuthenticationSchema = new Schema({
    
}, { timestamps: true })


module.exports = mongoose.model('Authentication', AuthenticationSchema)