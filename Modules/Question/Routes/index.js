'use strict'

const express = require('express')
const router = express.Router()
const Guard = require('../../../Middleware/auth')
const QuestionController = require('../Controllers/QuestionController')

router.post('/question', [Guard.isValidUser], (req, res, next) => {
    QuestionController.create(req, res, next)
})

router.patch('/question/:id', [Guard.isValidUser], (req, res, next) => {
    QuestionController.update(req, res, next)
})

router.get('/questions', [Guard.isValidUser], (req, res, next) => {
    QuestionController.getAll(req, res, next)
})

router.get('/question/:id', [Guard.isValidUser], (req, res, next) => {
    QuestionController.getOne(req, res, next)
})

router.delete('/question/:id', [Guard.isValidUser], (req, res, next) => {
    QuestionController.delete(req, res, next)
})

module.exports = router