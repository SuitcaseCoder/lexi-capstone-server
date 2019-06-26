const mongoose = require('mongoose');

const wordsSchema = mongoose.Schema({
    words: [{
        word: {type: String, required: true},
        definition: {type: String, required: true}
    }]
});

const usersSchema = mongoose.Schema({
    users: [{
        email: {type: String, required: true},
        password: {type: String, required: true}
    }]
});


const Users = mongoose.model('Users', usersSchema);
const Words = mongoose.model('Words', wordsSchema);

module.exports = {Words};
module.exports = {Users};
