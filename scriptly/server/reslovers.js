const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');

module.exports = {
    Query: {
        login: async (_, { email, password }) => {
            // ... login logic
        },
    },
    Mutation: {
        register: async (_, { username, email, password }) => {
            // ... register logic
        },
    },
};