import gql from "graphql-tag";

export const requestTypeDefs = gql`
type Request {
    _id: ID!
    author: Author!
    status: String!
    likes: Int!
    dislikes: Int!
    comments: [Comment!]!
    text: String!
    createdAt: String!
    scriptId: ID  
    scriptTitle: String 
}

  type Mutation {
    createRequest(scriptId:ID!,text:String!): Request!
    acceptRequest(scriptId: ID!, requestId: ID!): Boolean!
  }

`