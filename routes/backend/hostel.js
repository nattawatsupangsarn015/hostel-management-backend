const _ = require('lodash');
const express = require('express');
const route = express.Router()
const crypto = require('crypto')

//-------- set database ----------//

var mongoose = require('mongoose');
var userModel = require('../../model/userModel.js');
var productModel = require('../../model/productModel.js');
var bookingModel = require('../../model/bookingModel.js');
var db = mongoose.connection;

//------ auth management ------//
const jwt = require("jwt-simple");
const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const SECRET = "hostel-management";

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: SECRET
};

const jwtAuth = new JwtStrategy(jwtOptions, (user, done) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        userModel.find( (err, result) => {
            if (err) return console.error(err);
            var checkData = _.find(result, {username: user.username});
            if (checkData && (new Date().getTime() < user.exp)) done(null, true);
            else done(null, false);
        });
    });
});

passport.use(jwtAuth);

const requireJWTAuth = passport.authenticate("jwt",{session:false});

const loginMiddleWare = (req, res, next) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    const password = crypto.createHash('md5').update(req.body.password).digest("hex") + crypto.createHash('md5').update(SECRET).digest("hex")

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        userModel.find( (err, result) => {
            if (err) return console.error(err);
            var checkData = _.find(result, {username: req.body.username, password: crypto.createHash('md5').update(password).digest("hex")});
            if(checkData){
                const payload = {
                    username: checkData.username,
                    userId: checkData._id,
                    name: checkData.name,
                    lastName: checkData.lastName,
                    birthDay: checkData.birthDay,
                    email: checkData.email,
                    exp: new Date().getTime() + 86400000
                };
                res.status(200).send(jwt.encode(payload, SECRET));
            }
            else res.status(401).send("Your username or password is wrong.");
        });
    });
};

route.post("/login", loginMiddleWare, (req, res) => {
    res.send("Login success!")
});

route.post("/register", (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    const password = crypto.createHash('md5').update(req.body.password).digest("hex") + crypto.createHash('md5').update(SECRET).digest("hex")

    var user = new userModel({
        username: req.body.username,
        password: crypto.createHash('md5').update(password).digest("hex"),
        name: req.body.name,
        lastName: req.body.lastName,
        birthDay: req.body.birthDay,
        email: req.body.email
    })

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        userModel.find( (err, result) => {
            if (err) return console.error(err);
            var checkDuplicateUsername = _.find(result, {username: user.username});
            var checkDuplicateEmail = _.find(result, {email: user.email});
            if(checkDuplicateUsername) return res.status(500).send("Your username is already have in database.")
            else if(checkDuplicateEmail) return res.status(500).send("Your email is already have in database.")
            else {
                userModel.create(user, (err, result) => {
                    if(err) return console.log(err)
                    res.status(201).send("Created user success!");
                });
            }
        });
    });
});

route.post('/product', (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    var product = new productModel({
        name: req.body.name,
        detail: req.body.detail,
        price: req.body.price,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        allotment: req.body.allotment
    }) 

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        productModel.create(product, (err, result) => {
            if(err) return console.log(err)
            res.status(201).send("Created product success!");
        });
    });
})

route.get('/product', (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        productModel.find((err, result) => {
            if(err) return console.log(err)
            if(result.length !== 0) res.send(result)
            else res.status(404).send('Products not found.')
        });
    });
})

route.get('/product/:id', (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        productModel.find((err, result) => {
            if(err) return console.log(err)
            var productResult
            result.find(item => {
                if(item.id === req.params.id) 
                    productResult = item
            })

            if(productResult) res.send(productResult)
            else res.status(404).send('Product not found.')
        });
    });
})

route.put('/product/:id', (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    var product = {
        name: req.body.name,
        detail: req.body.detail,
        price: req.body.price,
        location: {
            lat: req.body.latitude,
            lng: req.body.longitude
        },
        allotment: req.body.allotment
    }

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        productModel.findOneAndUpdate({_id: req.params.id}, product, (err, result) => {
            if(err) return res.send(err)
            res.status(200).send('Update id : ' + req.params.id + ' success !')
        })  
    });
})

route.get('/product/search/:id', (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    var sendData

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        productModel.find({$or:[
            {
                name : {
                    $exists:true,
                    $regex: new RegExp("^" + req.params.id.toLowerCase()),$options:'i' 
                }
            },
            {
                detail: {
                    $exists:true,
                    $regex: new RegExp("^" + req.params.id.toLowerCase()),$options:'i' 
                }
            }
        ]}, (err, result) => {
            if (err) return console.error(err);
            sendData = result
            if(sendData.length !== 0) {
                res.send(sendData)
            }
            else {
                res.status(404).send('Data not found.')
            }
        });
    });
})

route.delete('/product/:id', (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        productModel.deleteOne({ _id: req.params.id }, (err, result) => {
            if(err) return res.status(404).send("Can't delete this product.")
            res.status(200).send('Delete product success!')
        });
    });
})

route.get('/booking/:id', requireJWTAuth, (req, res) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    var sendData

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        bookingModel.find({userId : req.params.id}, (err, result) => {
            if (err) return console.error(err);
            sendData = result
            if(sendData.length !== 0) {
                res.send(sendData)
            }
            else {
                res.status(404).send('Data not found.')
            }
        });
    });
})

route.post('/booking', (req, res, next) => {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    var booking = new bookingModel({
        bookingNumber: 'HM' + new Date().getTime(),
        dateTravel: req.body.dateTravel,
        userId: req.body.userId,
        productId: req.body.productId,
        amount: req.body.amount,
        price: req.body.price,
        name: req.body.name,
        lastName: req.body.lastName,
        birthDay: req.body.birthDay,
        email: req.body.email
    }) 

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        bookingModel.create(booking, (err, result) => {
            if(err) return console.log(err)
        });

        next()
        res.status(201).send('Create booking success.')
    });
}, updateAllotment)

async function updateAllotment(req, res) {
    mongoose.connect('mongodb://localhost:27017/hotel', {"useNewUrlParser": true})

    var product = {
        allotment: req.body.allotment
    }

    db.on('error', console.error.bind(console, 'connection error:'));
    await db.once('open', () => {
        productModel.findByIdAndUpdate({_id: req.body.productId}, product, (err, result) =>{
            if(err) res.send(err)
        })
    })

}

module.exports = route;