import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import { typeDefs } from "./schema";

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
            process.env.NEO4J_PASSWORD || "password"
        )
    );

    const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

    const schema = await neoSchema.getSchema();
    const server = new ApolloServer({ schema });

    await server.start();

    const app = express();

    app.use(
        "/graphql",
        cors(),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const apiKey = req.headers["x-api-key"];

                if (
                    ENABLE_API_KEYS &&
                    (!apiKey || !VALID_API_KEYS.includes(apiKey as string))
                ) {
                    throw new Error("Unauthorized: Invalid API Key");
                }

                return { req, apiKey };
            },
        })
    );

    app.get("/health", (req, res) => {
        res.status(200).send("OK!");
    });

    const PORT = Number(process.env.PORT) || 4000;

    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`🩺 Health check at http://localhost:${PORT}/health`);
    });
}

startServer().catch(console.error);
