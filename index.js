var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var jsonParser = bodyParser.json();

var User = require('./models/user');

app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            return res.status(500).json({
               message: 'Internal Server Error' 
            });
        }
        res.status(200).json(users);
    });
});

app.post('/users', jsonParser, function(req, res) {
    User.create({
        username: req.body.username
    }, function(err, user) {
         if (!req.body.username) {
            return res.status(422).json({
                message: 'Missing field: username'
            });
        }
        else if (typeof req.body.username != 'string') {
            return res.status(422).json({
               message: 'Incorrect field type: username' 
            });
        }
        else if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.location('/users/' + user._id);
        res.status(201).json({});
    });
});

app.get('/users/:userId', function(req, res) {
    User.findOne({
        _id: req.params.userId
    },function(err, user) {
        if (err || !user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
       res.status(200).json(user); 
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    User.findByIdAndUpdate(
        {_id: req.params.userId},
        { $set: {username: req.body.username}},
        { upsert: true, new: true, setDefaultsOnInsert: true }
    , function(err) {
        console.log(req.body);
         if (!req.body.username) {
            return res.status(422).json({
                message: 'Missing field: username'
            });
        }
        else if (typeof req.body.username != 'string') {
            return res.status(422).json({
               message: 'Incorrect field type: username' 
            });
        }
        else if (err) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
        res.status(200).json({});
    });
});

app.delete('/users/:userId', jsonParser, function(req, res) {
    User.findOneAndRemove(
        {_id: req.params.userId},
       function(err, user) {
           if(err || !user) {
               return res.status(404).json({
                   message: 'User not found'
               });
           }
           res.status(200).json({});
           console.log('Delete item');
       }
    );
});
// Add your API endpoints here

var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
    mongoose.connect(databaseUri).then(function() {
        var port = process.env.PORT || 8080;
        var server = app.listen(port, function() {
            console.log('Listening on localhost:' + port);
            if (callback) {
                callback(server);
            }
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;

