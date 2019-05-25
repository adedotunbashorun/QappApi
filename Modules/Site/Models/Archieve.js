'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArchieveSchema = new Schema({
    from: { type: String },
    data: { type: String }
}, { timestamps: true })


module.exports = mongoose.model('Archieve', ArchieveSchema)