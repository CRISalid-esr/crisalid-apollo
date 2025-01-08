import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import { typeDefs } from "./schema";
import type { IncomingMessage } from "http";

dotenv.config();
const ENABLE_API_KEYS = process.env.ENABLE_API_KEYS !== "false";
const VALID_API_KEYS = (process.env.API_KEYS || "")
  .split(",")
  .map((key) => key.trim());

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
    context: async ({ req }: { req: IncomingMessage }) => {
      const apiKey = req.headers["x-api-key"];

      if (
        ENABLE_API_KEYS &&
        (!apiKey || !VALID_API_KEYS.includes(apiKey as string))
      ) {
        throw new Error("Unauthorized: Invalid API Key");
      }

      return { req, apiKey };
    },
    listen: { port: Number(process.env.PORT) || 4000 },
  });
  console.log(`🚀 Server ready at ${url}`);
}

startServer().catch(console.error);
