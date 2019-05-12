'use strict'

const express = require('express')
const router = express.Router()
const BulkMessageController = require('../Controllers/BulkMessageController')

router.post('/message/create', (req, res, next) => {
    BulkMessageController.create(req, res, next)
})

router.patch('/message/update/:id', (req, res, next) => {
    BulkMessageController.update(req, res, next)
})

router.get('/message/all', (req, res, next) => {
    BulkMessageController.getAll(req, res, next)
})

router.get('/message/:id', (req, res, next) => {
    BulkMessageController.getMessage(req, res, next)
})

module.exports = router