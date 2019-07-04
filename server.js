
'use strict';
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
// const morgan = require('morgan');
// const passport = require('passport');

const {PORT, DATABASE_URL} = require('./config');
const {Word} = require('./models');
const{User} = require('./models');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(cors());
app.use(express.static('public'));

// GET 
//get all words
//change this to get all words under a specific user
//so first get the speicific user /{user} then get the words /{words}

// ----------------------------------------------------
// app.get('/words', (req,res) => {
//     Word
//         .find()
//         // .exec()
//         .then(words => {
//             console.log(words);
//          return res.json(words)
//         })
//         .catch(err => {
//         console.log(err);
//         return res.status(500).json({message: 'internal server error'});
//         });
// });
// ----------------------------------------------------


// app.get('/{user}/words', (req,res)=> {
//     Users
//         .findById(req.body.user)
//         .populate('words')
//         // .exec()
//         .then(users => {
//             console.log(users);
//             return res.json(users)
//         })
//         .catch(err => {
//             console.log(err => {
//                 console.log(err);
//                 return res.status(500).json({message: 'internal server error'})
//             })
//         });
// });

// POST
//post new word to specific user account
// later change to /{user}/words
app.post('/words', jsonParser, (req, res) => {
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
        }).then(word => 
// -------------------------------------------------- words under users
//         .then(word => {
//             console.log(word);

//             Users.findByIdAndUpdate(req.body.users, {
//                 $push: {words:word._id}
//             })
//             .then( _ => {
//                 return res.status(201).json(word)}
//             )}
//         )
//             .catch(err => {
//                 console.log(err);
//                 res.status(500).json({message: 'Internal server error'});
//             });
// });
// --------------------------------------------------------          
            
            res.status(201).json(word)
        )
        .catch(err => {
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
        });
});

// --------------------------------------------------------          
// POST TO REGISTER A NEW USER

app.post('/create-user', jsonParser, (req,res)=>{
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
    
    return User.find({username})
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
            return URIError.create({
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
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});

app.get('/', (req,res)=> {
    return User.find()
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// --------------------------------------------------------          

// POST
//post new user at user signup
// app.post('/create-user', jsonParser, (req, res) => {
//     console.log(req.body);
//     const requiredFields = ['name', 'email', 'password'];
//     for (let i=0; i<requiredFields.length; i++) {
//         const field = requiredFields[i];
//         if (!(field in req.body)) {
//         const message = `Missing \`${field}\` in request body`
//         console.log(message);
//         return res.status(400).send(message);
//         }
//     }

//     Users
//         .create({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password
//         })
//         .then(
//         user => res.status(201).json(user)
//         )
//         .catch(err => {
//         console.log(err);
//         res.status(500).json({message: 'Internal server error'});
//         });
// });

//DELETE
// delete word from list of all words
app.delete('/delete/:id', (req, res) => {
    Word
        .findByIdAndRemove(req.params.id)
        .then(word =>
        res.status(204).end())
        .catch(err =>
        console.log(err))
        res.status(500).json({message:'Internal server error'})
        ;
})

//RUN SERVER
let server;
function runServer(port, databaseUrl){
return new Promise( (resolve, reject) => {
    mongoose.set('debug', true);
    mongoose.connect(databaseUrl,
        err => {
        if (err){
            return reject(err);
        }
        else{
            server = app.listen(port, () =>{
            console.log('Your app is running in port ', port);
            resolve();
            })
            .on('error', err => {
            mongoose.disconnect();
            return reject(err);
            });
        }

    }
    );
});
}


function closeServer() {
return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
    if (err) {
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