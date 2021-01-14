const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

let User = require('./models/user');


//make express app, set port
const app = express();
const port = process.env.PORT || 1337;

//use body parser to grab information from POST requests
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



//configure our app to the handle CORS requests
app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Methods', 'X-Requested-With, content-type, Authorization');
    next();
});

//log all requests
app.use(morgan('dev'));


//db
mongoose.connect('mongodb://localhost:27017/myDb');


//routes for the api

//routes for home page
app.get('/', function(req,res){
    res.send('Welcome to the home page!');
})

//get instance of express router
let apiRouter = express.Router();


//middleware
apiRouter.use(function(req,res, next){
    console.log('Somebody just came to our app');
    next();
});

//test route to make sure everything,
apiRouter.get('/', function (req,res){
    res.json ({message: 'welcome to our api!'});
});

//add routes that end in user
apiRouter.route('/users')
    .post(function(req,res){
        let user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if(err){
                if (err.code === 11000)
                    return res.json({success: false, message: "A user with that username already exists"});
            else
                return res.send(err);
            }
            res.json({message: 'User created!'});
        })
    })
    .get(function(req,res){
        User.find(function(err,users){
            if (err) res.send(err);
            res.json(users);
        })
    })


//on rotes that end in /users/:user_id

apiRouter.route('/users/:user_id')

//get the user with that id
//accessed at GET http://localhost:1337/api/users/:user_id

.get(function(req, res){
    User.findById(req.params.user_id, function(err, user){
        if (err) res.send(err);

        res.json(user);
    })
})

.put(function(req, res){
    User.findById(req.params.user_id, function(err, user){
        if (err) res.send(err);

        if(req.body.name) user.name = req.body.name;
        if(req.body.username) user.username = req.body.username;
        if(req.body.password) user.password = req.body.password;

        user.save(function(err){
            if (err) res.send(err);

            res.json({message: 'User Updated!'})
        })
    })
})

.delete(function(req, res){
    User.remove({
        _id: req.params.user_id
    }, function (err, user){
        res.json ({message: 'Successfully deleted'})
    })
})

//register routes

app.use('/api', apiRouter);

app.listen(port);
console.log('magic happens on ' +  port);

