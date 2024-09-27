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
        id:ID!
        title:String!
        completed:Boolean
        }
        type Query {
        getTodos:[Todo]
        getAllUser:[User]
        }
        `,
        resolvers: {
            Query: {
                geTodos: async () => (await axios.get("https://jsonplaceholder.typicode.com/todos/1")).data
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