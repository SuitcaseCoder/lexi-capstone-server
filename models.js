'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise

// const UserSchema = mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     firstName: {type: String, default: ''},
//     lastName: {type: String, default: ''}
// })

// UserSchema.methods.serialize = function() {
//     return {
//         username: this.username || '',
//         firstName: this.firstName || '',
//         lastName: this.lastName || ''
//     };
// };

// UserSchema.methods.validatePassword = function(password) {
//     return bcrypt.compare(password, this.password);
// };

// UserSchema.statics.hasPassword = function(password) {
//     return bcrypt.hash(password, 10);
// };

//modeling data inside one object
// define only key: value pairs inside schema. we are crating 'user' doc 
const UserSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    words: [{type: mongoose.Schema.Types.ObjectId, ref: 'Words'}]
});

const WordSchema = mongoose.Schema({
    word: {type: String, required: true},
    definition: {type: String, required: true}
});

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);
const Word = mongoose.model('Word', WordSchema);

module.exports = {Word, User};
