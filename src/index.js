import { ApolloServer } from "apollo-server";
import gql from "graphql-tag";
import { createApolloFetch } from "apollo-fetch";
import { getUserById } from "./queries";
import jwt from "jsonwebtoken";

const SECRET = "testing";
const IS_PROD = process.env.MODE === "prod";
const uri = "links";

export const apolloFetch = createApolloFetch({ uri });
apolloFetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers["X-Hasura-Admin-Secret"] = process.env.HASURA_SECRET;

  next();
});

const typeDefs = gql`
  type CurrentUser {
    id: String
    email: String
    planId: String
  }

  type Query {
    getCurrentUser: CurrentUser
  }
`;

const resolvers = {
  Query: {
    getCurrentUser: (parent, params, ctx) => {
      if (ctx.user !== null)
        return getUserById(ctx.user.id).then(resp => resp.data.currentUser);

      return null;
    }
  }
};

const schema = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  context: ({ req }) => {
    const token = req.headers.user || "";

    // try to retrieve a user with the token
    try {
      const user = jwt.verify(token, SECRET);

      // add the user to the context
      return { user };
    } catch (e) {
      return { user: null };
    }
  }
});

schema.listen(3002).then(({ url }) => {
  console.log(`schema ready at ${url}`);
});
