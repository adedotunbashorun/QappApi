const fs = require("fs")
let shell = require("shelljs")
const cron = require("node-cron")
const Activity = require('./activity')
const Amadeus = require('./amadeus')
const BulkMessage = require('../models/bulk_message')



cron.schedule("*/10 * * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 1")
    Amadeus.Authentication()
})

cron.schedule("*/01 * * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 2")
    try {
        BulkMessage.find({ type: 'every minutes'}).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("00 01 * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 3")
    try {
        BulkMessage.find({ type: 'hourly' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("* * * * Friday", function () {
    console.log("---------------------")
    console.log("Running Cron Job 5")
    try {
        BulkMessage.find({ type: 'weekly' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("* * */28 * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 6")
    try {
        BulkMessage.find({ type: 'monthly' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("00 00 01 * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 7")
    try {
        BulkMessage.find({ type: 'monthly', title: 'New Month' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("* * */01 */04 *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 8")
    try {
        BulkMessage.find({ type: 'quarterly' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("* * */01 */12 *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 9")
    try {
        BulkMessage.find({ type: 'annually' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("59 23 * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 4")
    try {
        BulkMessage.find({ type: 'daily' }).sort('-createdAt').then((messages) => {
            messages.forEach(message => {
                Activity.BulkEmail(message)
            })
        }, (error) => {
            console.log(error)
        })
    } catch (err) {
        console.log(err)
    }
})

// deleting error.log files from server on the 21st of every month
cron.schedule("* * */21 * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job")
    fs.unlink("./error.log", err => {
        if (err) throw err
        console.log("Error file succesfully deleted")
    })
})


// To backup a database
cron.schedule("59 23 * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job")
    if (shell.exec("sqlite3 database.sqlite  .dump > data_dump.sql").code !== 0) {
        shell.exit(1)
    } else {
        shell.echo("Database backup complete")
    }
})