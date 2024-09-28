const express = require("express")
const { ApolloServer } = require("@apollo/server")
const bodyParser = require("body-parser")
const { expressMiddleware } = require("@apollo/server/express4")
const cors = require("cors")
const axios = require("axios")
// const bodyParser = require(bodyParser)
async function startServer(params) {
    const app = express()
    const server = new ApolloServer({
        typeDefs: `
        type User {
        id:ID!
        name:String!
        username:String!
        email:String!
        phone:String!
        }
        type Todo {
        userId:ID!
        id:ID!
        title:String!
        completed:Boolean
        user:User
        }
        type Query {
        getTodos:[Todo]
        getAllUsers:[User]
        getUser(id:ID!):User
        }
        `,
        resolvers: {
            Todo: {
                user: async (todo) => {
                    const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`);
                    return response.data;
                }
            },
            Query: {
                getTodos: async () => {
                    const response = await axios.get("https://jsonplaceholder.typicode.com/todos");
                    return response.data;
                },
                getAllUsers: async () => {
                    const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                    return response.data;
                },
                getUser: async (parent, { id }) => {
                    const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
                    return response.data;
                },
            }
        }
    })

    app.use(bodyParser.json())
    app.use(cors())

    await server.start()

    app.use("/graphql", expressMiddleware(server))
    app.listen(8000, () => console.log("Server Started at PORT 8000"))
}
startServer()