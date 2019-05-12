let express = require('express')
let morgan = require('morgan')
let path = require('path')
let mongoose = require('mongoose')
// let cors = require('./Middleware/cors')
let bodyParser = require('body-parser')
let cors = require('cors')
const config = require('./config')
app = express()

var passport = require('passport')

const port = config.app.port

try {
    mongoose.set('useCreateIndex', true)
    mongoose.connect(config.db.url, { useNewUrlParser: true }).then(() => { // if all is ok we will be here
        console.log("connected")
    }).catch(err => { // we will not be here...
        console.error('App starting error: Network Issue')
        return { error: err.stack, message: "Error Connecting to mongo db" }
        process.exit()
    })
} catch (err) {
    console.log(err)
    process.exit()
}
require('./passport-config')

app.use(passport.initialize())

app.use(cors({
    origin: ['https://qappdevtest.herokuapp.com', 'http://localhost:3000'],
    credentials: false
}))

//middleware for login your request
app.use(morgan('dev'))

//parses the JSON, buffer, formdata, string and URL encoded data submitted using HTTP POST request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//this only accept formdata
// app.use(express.json({ limit: '50mb' }))
// app.use(express.urlencoded({ limit: '50mb', extended: false }))

//set static folder
app.use(express.static(path.join(__dirname, '/')))
app.use('/', express.static(path.join(__dirname, '/')))

const authRoutes = require('./Modules/Authentication/Routes')
const userRoutes = require('./Modules/User/Routes')
const categoryRoutes = require('./Modules/Category/Routes')
const questionRoutes = require('./Modules/Question/Routes')
const siteRoutes = require('./Modules/Site/Routes')
const bulkRoute = require('./Modules/BulkMessage/Routes')

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', questionRoutes)
app.use('/api', siteRoutes)
app.use('/api', bulkRoute)

app.listen(port)
console.log('server started ' + port)