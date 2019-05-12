module.exports = production = {
    app: {
        port: process.env.PORT || 5000
    },
    db: {
        url: (process.env.MONGODB_URI) ? process.env.MONGODB_URI : 'mongodb://heroku_bmdx8f5p:c0jcg5l8lha8sf64pji0i3hfk6@ds155616.mlab.com:55616/heroku_bmdx8f5p',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 27017,
        name: process.env.DB_DATABASE        
    }
}