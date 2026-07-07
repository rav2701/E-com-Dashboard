import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";

export const runtime = "nodejs";

const yoga = createYoga({
  schema: makeExecutableSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => "world",
      },
    },
  }),
  graphqlEndpoint: "/api/graphql",
  cors: { origin: "*", credentials: true },
});

export async function GET(request: Request) {
  return yoga.fetch(request);
}

export async function POST(request: Request) {
  return yoga.fetch(request);
}
