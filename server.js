
'use strict';
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const {PORT, DATABASE_URL} = require('./config');
const {Words} = require('./models');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;



app.use(express.static('public'));

// GET 

app.get('/', (req,res) => {
Wors
    .find()
    .exec()
    .then(words => {
    return res.json(words)
    })
    .catch(err => {
    console.log(err);
    return res.status(500).json({message: 'internal server error'});
    });
});

// POST

app.post('/', jsonParser, (req, res) => {
// ensure `name` and `budget` are in request body
const requiredFields = ['word', 'definition'];
for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
    const message = `Missing \`${field}\` in request body`
    console.log(message);
    return res.status(400).send(message);
    }
}

Words
    .create({
    word: req.body.word,
    definition: req.body.definition
    })
    .then(
    event => res.status(201).json(event)
    // .json(obj)
    )
    .catch(err => {
    console.log(err);
    res.status(500).json({message: 'Internal server error'});
    });

});

//POST USERS

// app.post('/users', jsonParser, (req, res) => {
// // ensure `name` and `budget` are in request body
// const requiredFields = ['email', 'password'];
// for (let i=0; i<requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//     const message = `Missing \`${field}\` in request body`
//     console.error(message);
//     return res.status(400).send(message);
//     }
// }

// Users
//     .create({
//     email: req.body.email,
//     password: req.body.password,
//     })
//     .then(user => {
//     console.log('---------------------------')
//     console.log(user);
//     console.log('---------------------------')

//     .catch(err => {
//     console.log(err);
//     res.status(500).json({message: 'Internal server error'});
//     });

// });

// app.get('/words/:id', (req,res) => {
// Words
//     .findById(req.params.id)
//     .then(expense => res.json(expense))

//     // .then(populate('expenses'))
//     //
//     .then(expenses => {
//     console.log(res.json(expenses.serialize()))
//     })
//     .catch(err => {
//     console.log(err);
//     res.status(500).json({message: 'internal server error'});
//     });
// });

//DELETE - CREATE DELETE REQUEST USING FIND BY ID: // ON SCRIPT.JS WRITE A FUNCTION THAT TRIGGERS THAT SPECIFIC ID/ELEMENT TO BE REMOVED FROM DOM

app.delete('/words/:id', (req, res) => {
Words
    .findByIdAndRemove(req.params.id)
    .then(event =>
    res.status(204).end())
    .catch(err =>
    console.log(err))
    // res.status(500).json({message:'Internal server error'})
    ;

})


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