const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    avatarUrl: String
    tasks: [Task!]
    projects: [Project!]
  }

  type Project {
    id: ID!
    name: String!
    description: String
    owner: User!
    members: [User!]
    tasks: [Task!]
    createdAt: String!
    updatedAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: TaskPriority!
    assignee: User
    project: Project!
    createdAt: String!
    updatedAt: String!
  }

  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    projects: [Project!]
    project(id: ID!): Project
    tasks(projectId: ID!): [Task!]
    task(id: ID!): Task
    hello: String
  }

  type Mutation {
    # User Mutations
    updateUser(name: String, avatarUrl: String): User

    # Project Mutations
    createProject(name: String!, description: String): Project!
    updateProject(id: ID!, name: String, description: String): Project
    deleteProject(id: ID!): Project
    addProjectMember(projectId: ID!, userId: ID!): Project
    removeProjectMember(projectId: ID!, userId: ID!): Project

    # Task Mutations
    createTask(title: String!, projectId: ID!, description: String, assigneeId: ID, priority: TaskPriority): Task!
    updateTask(id: ID!, title: String, description: String, status: TaskStatus, priority: TaskPriority, assigneeId: ID): Task
    deleteTask(id: ID!): Task
  }
`;

const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    users: async () => {
      return prisma.users.findMany();
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
