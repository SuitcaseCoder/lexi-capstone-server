
'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const {PORT, DATABASE_URL} = require('./config');
const {Word} = require('./models');
const{User} = require('./models');


const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const bodyParser = require('body-parser');
mongoose.set('useFindAndModify', false);

// const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(cors());
app.use(express.static('public'));

app.use(morgan('common'));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', {session: false});

app.get('/', function(req, res){
    res.redirect('/todo');
 });
// ---------- EDIT WORD -----------------          
app.put('/editWord/:id', jwtAuth, (req, res) => {
    Word
    .findByIdAndUpdate(req.params.id, {
        word: req.body.updatedWord,
        definition: req.body.updatedDef
    }, 
    //this is what updates
    { new: true },
    function(err, result){
       if(err){
           console.log(err);
       }
       //bodyparser - server side, translator ( )
       //json stringify - front-end, turns obj into a string and server reads it using bodyparser
       //res is what's being sent back, json sends it back as json and give it the thing you're sending back 
       res.status(200).json(result);
    })
})


// ---------- GET WORDS -----------------          
app.get('/words/protected', jwtAuth, (req,res) => {
    Word
        .find()
        .then(words => {
            console.log(words);
         return res.json(words)
        })
        .catch(err => {
        console.log(err);
        return res.status(500).json({message: 'internal server error'});
        });
});

// ---------- CREATE WORD -----------------          
//remove protected to just /create-word

app.post('/create-word/protected', jwtAuth, (req, res) => {
    console.log(req.body);
    const requiredFields = ['word', 'definition'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.log(message);
        return res.status(400).send(message);
        }
    }

    Word
        .create({
            word: req.body.word,
            definition: req.body.definition
        }).then(word => res.status(201).json(word)
        )
        .catch(err => {
        console.log(`error on line server 116`, err);
        res.status(500).json({message: 'Internal server error'});
        });
});

// ---------- CREATE USER -----------------          

app.post('/create-user', (req,res)=>{
    const requiredFields = ['username', 'password', 'firstName', 'lastName'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if(missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if(nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10,
            max: 50
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] && 
                req.body[field].trim().length < sizedFields[field].min
    );

    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
                req.body[field].trim().length > sizedFields[field].max
    );

    if  (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField 
                ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
                : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {username, password, firstName = '', lastName=''} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();
    
    //needed full key-value pair. OR findbyId with (id)
    // find where the error is taking place, visit documentation to view examples
    return User.find({username:username})
        .count()
        .then(count => {
            if (count > 0 ){
                return Promise.reject({
                    code: 422, 
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error',});
        });
});


// ---------- DELETE WORD -----------------          

app.delete('/delete/:id', jwtAuth, (req, res) => {
    Word
    .findByIdAndRemove(req.params.id)
    .then(() => {
        Word
            .find()
            .then(updatedWordList => {
                console.log(`updated word list ----------`, updatedWordList);
                return res.json(updatedWordList)
            })
    })

    .catch(err => res.status(500).json({message: "Internal server error"}));     
});



// ---------- RUN SERVER -----------------          
let server;
function runServer(port, databaseUrl){
    console.log(`db url = `, databaseUrl, port);
return new Promise( (resolve, reject) => {
    mongoose.set('debug', true);
    mongoose.connect(databaseUrl,
        err => {
        if (err){
            console.log('-------first err in runServer ----------------',err);
            return reject(err);
        }
        else{
            server = app.listen(port, () =>{
            console.log('Your app is running in port ', port);
            resolve();
            })
            .on('error', err => {
                console.log(`error on run server in server file -----------------`, err);
            mongoose.disconnect();
            return reject(err);
            });
        }

    }
    );
});
}

// ---------- CLOSE SERVER -----------------          

function closeServer() {
return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
    if (err) {
        //should this be: return reject(err);
        reject(err);
        return;
    }
    resolve();
    });
});
}

if (require.main === module) {
runServer(PORT, DATABASE_URL).catch(err => console.error(err));
}

module.exports = {runServer, closeServer, app}