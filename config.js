'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/lexi'
// "https://evening-sierra-54551.herokuapp.com"
// 'mongodb://localhost/lexi'
// ''mongodb://localhost:27017';
// https://evening-sierra-54551.herokuapp.com
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-lexi';

exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '25d';