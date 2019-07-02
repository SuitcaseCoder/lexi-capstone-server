
'use strict';
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

const {PORT, DATABASE_URL} = require('./config');
const {Words} = require('./models');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(cors());
app.use(express.static('public'));

// GET 
//get all words
app.get('/words', (req,res) => {
    Words
        .find()
        // .exec()
        .then(words => {
            console.log(words);
         return res.json(words)
        })
        .catch(err => {
        console.log(err);
        return res.status(500).json({message: 'internal server error'});
        });
});

// POST
//post new word to all words
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

    Words
        .create({
        word: req.body.word,
        definition: req.body.definition
        })
        .then(
        event => res.status(201).json(event)
        )
        .catch(err => {
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
        });
});

//DELETE
// delete word from list of all words
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