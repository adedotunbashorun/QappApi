'use strict'

const Activity = require('../Models/ActivityLog')
const Schedule = require('../Models/Schedule')

class activitytController {

    static getAll(req, res, next) {
        try {
            Activity.find({}).sort('-createdAt').populate("user_id").then((activities) => {
                return res.status(201).json({ activities: activities })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static getAllSchedule(req, res, next) {
        try {
            // Schedule.aggregate([
            //     {
            //         $group: {
            //             _id: '$user_id',
            //             questions: { $push: "$question_id" },
            //             count: { $sum: 1 }
            //         }
            //     }
            // ]).then((schedules) =>{
            //     return res.status(201).json({ schedules: schedules })
            // })
            Schedule.find({}).sort('-createdAt').populate("user_id").populate("category_id").populate("question_id").then((schedules) => {
                return res.status(201).json({ schedules: schedules })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static getUserSchedule(req, res, next) {
        try {
            Schedule.find({ user_id: req.params.user_id}).sort('-createdAt').populate("category_id").populate("question_id").then((schedules) => {
                return res.status(201).json({ schedules: schedules })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static getuserAll(req, res, next) {
        try {
            Activity.find({ user_id: req.params.user_id }).sort('-createdAt').populate("user_id").then((activities) => {
                return res.status(201).json({ activities: activities })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static getuserLastFive(req, res, next) {
        try {
            Activity.find({ user_id: req.params.user_id }).sort('-createdAt').limit(5).then((activities) => {
                return res.status(201).json({ activities: activities })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }
}
module.exports = activitytController