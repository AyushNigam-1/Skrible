const express = require("express")
const { ApolloServer } = require("@apollo/server")
const bodyParser = require("body-parser")
const { expressMiddleware } = require("@apollo/server/express4")
const cors = require("cors")

// const bodyParser = require(bodyParser)
async function startServer(params) {
    const app = express()
    const server = new ApolloServer({
        typeDefs: `
        type Todo {
        id:ID!
        title:String!
        completed:Boolean
        }
        type Query {
        getTodos:[Todo]
        }
        `,
        resolvers: {
            Query: {
                geTodos: () => [{ id: 1, title: "Something Something", completed: false }]
            }
        }
    })

    app.use(bodyParser.json())
    app.use(cors())

    await server.start()

    app.use("/graphql", expressMiddleware(server))
    app.listen(8000, () => console.log("Server Started at PORT 8000"))
}