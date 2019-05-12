'use strict'

const Activity = require('../Models/ActivityLog')

class activitytController {

    static getAll(req, res, next) {
        try {
            Activity.find({ deleted_at: null }).sort('-createdAt').populate("user_id").then((activities) => {
                return res.status(201).json({ activities: activities })
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