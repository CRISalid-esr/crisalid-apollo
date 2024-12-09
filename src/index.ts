import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import { typeDefs } from "./schema";
import type { IncomingMessage } from "http";

dotenv.config();

async function startServer() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || "neo4j://localhost:7687",
    neo4j.auth.basic(
      process.env.NEO4J_USER || "neo4j",
      process.env.NEO4J_PASSWORD || "password",
    ),
  );

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

  const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
  });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }: { req: IncomingMessage }) => ({ req }),
    listen: { port: Number(process.env.PORT) || 4000 },
  });
  console.log(`🚀 Server ready at ${url}`);
}

startServer().catch(console.error);
