const express = require('express')
const config = require('config')
const path = require('path')
const mongoose = require('mongoose')
const https = require('https')
const fs = require('fs')

const app = express()

app.use(express.json({extended: true}))

app.use('/api/auth', require('./routes/auth.routes'))

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

async function start() {
    try {
        await  mongoose.connect(config.get("mongoUri"), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })

        //http
        const HTTP_PORT = config.get("httpPort") || 5000
        app.listen(HTTP_PORT, () => console.log(`App has been started on port ${HTTP_PORT}...`))

        //https
        if (process.env.NODE_ENV === 'production') {
            const HTTPS_PORT = config.get("httpsPort") || 5443
            https.createServer({
                key: fs.readFileSync(config.get("pathHttpsKey")),
                cert: fs.readFileSync(config.get("pathHttpsCert"))
            }, app).listen(HTTPS_PORT, () => console.log(`App has been started on port ${HTTPS_PORT}...`))
        }
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()
