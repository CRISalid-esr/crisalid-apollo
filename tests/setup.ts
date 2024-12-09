import neo4j, { Driver } from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { typeDefs } from "../src/schema";
import { ApolloServer } from "@apollo/server";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

let driver: Driver;

beforeAll(async () => {
  driver = neo4j.driver(`${process.env.NEO4J_URI}`);
  await clearDatabase(driver);
});

afterEach(async () => {
  await clearDatabase(driver);
});

afterAll(async () => {
  await driver.close();
});

export const createTestServer = async () => {
  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  const schema = await neoSchema.getSchema();
  return new ApolloServer({ schema });
};

export const runCypherFile = async (filePath: string) => {
  const session = driver.session();
  const cypher = fs.readFileSync(filePath, "utf-8");

  try {
    await session.run(cypher);
  } finally {
    await session.close();
  }
};

const clearDatabase = async (driver: Driver) => {
  const session = driver.session();
  try {
    await session.run(`MATCH (n) DETACH DELETE n`);
  } finally {
    await session.close();
  }
};
