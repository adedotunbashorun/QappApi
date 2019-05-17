'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

const CategorySchema = new Schema({
    name: { type: String, required: true, index: { unique: true, dropDups: true } },
    description: { type: String, required: true },
}, { timestamps: true })

CategorySchema.plugin(uniqueValidator)
module.exports = mongoose.model('Category', CategorySchema)