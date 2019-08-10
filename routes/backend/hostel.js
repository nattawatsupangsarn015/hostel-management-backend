const _ = require('lodash');
const express = require('express');
const route = express.Router()

route.get('/test', (req, res) => {
    res.send('test api')
})

module.exports = route;