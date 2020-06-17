const express = require('express');
const config = require('./config/mongo-connect');  // import mongoDB configuration
const session = require('express-session');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Middleware for body parsing
const parseUrl = express.urlencoded({ extended: false })
const parseJson = express.json({ extended: false })

app.use(session(
    {
        secret: 'codenameprox',
        saveUninitialized: false,
        resave: false
    }));

app.set('view engine', 'ejs')

// import models
const versionModel = require('./models/version-model');
const mainservicemodel = require('./models/mainservice-model');


//import routes
const customerRouter = require("./routes/customer-router");
const subserviceRouter = require('./routes/subservice-router');
const workerRouter = require("./routes/worker-router");
const companyRouter = require("./routes/company-router");
const orderRouter = require('./routes/order-router');
const workerRequest = require('./routes/workrequest-route');
const loginRouter = require('./routes/login-route');


// set relative path
app.use('/customer', [parseUrl,parseJson], customerRouter)
app.use('/services', [parseUrl,parseJson], subserviceRouter)
app.use('/worker', [parseUrl,parseJson], workerRouter)
app.use('/company', [parseUrl,parseJson], companyRouter)
app.use('/orders', orderRouter)
app.use('/request', [parseUrl,parseJson], workerRequest)
app.use('/auth', [parseUrl,parseJson], loginRouter)

// version check for mobile app
app.get('/checkserviceversion', async (req, res) => {
    let serviceVersion = req.query.serviceVersion;
    let offerVersion = await versionModel.find({}, 'offerVersion -_id')
    if (serviceVersion == offerVersion[0].offerVersion) {
        res.send({ "versionChange": false });
    } else {
        let mainservice = await mainservicemodel.find({})
        res.send({ "versionChange": true, "services": mainservice, "version": offerVersion[0].offerVersion })
    }
})




// Initialze Server
app.listen(3000, () => {
    console.log("App listening at port 3000");
});