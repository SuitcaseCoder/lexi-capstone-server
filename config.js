'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://lexiUser:lexi123@lexi-rrqwl.mongodb.net/test?retryWrites=true&w=majority'
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb+srv://lexiUser:lexi123@lexi-rrqwl.mongodb.net/Words?retryWrites=true&w=majority';
exports.PORT = process.env.PORT || 8080;
