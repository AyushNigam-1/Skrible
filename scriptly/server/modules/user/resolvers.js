const User = require('./model');

const resolvers = {
    Query: {
        user: (parent, { id }) => User.findById(id),
        users: () => User.find()
    },
    Mutation: {
        createUser: (parent, args) => User.create(args)
    }
};

module.exports = resolvers;
