# CRISalid Institutional Knowledge Graph Apollo GraphQL API

This project is an Apollo GraphQL API that provides access to the CRISalid Institutional Knowledge Graph
through [Apollo Server](https://www.apollographql.com/docs/apollo-server/) and
[Neo4j GraphQL](https://neo4j.com/docs/graphql/current/).

### Installation

The project requires Node.js and npm to be installed. The following command will install the project dependencies:

```bash
npm install
```

### Configuration

Copy the `.env.example` file to `.env` and set the environment variables to match your configuration.

### Running the server

#### Without Docker

The following command will start the server:

```bash
npm start
```

The server will be available at `http://localhost:4000` (or the port specified in the `.env` file).

#### With Docker

In your `.env` file, change the `NEO4J_URI` variable from `neo4j://localhost:7687` to `neo4j://neo4j:7687`.

Copy the `neo4j/.env.sample` file to `neo4j/.env` and set the environment variables to match your configuration.

If you want to restore a Neo4j database from a dump, copy the dump file to `neo4j/dump/neo4j.dump` and run:

```bash
RESTORE_NEO4J_DUMP=true docker compose up
```

If you want to start the server without restoring a dump, run:

```bash
docker compose up
```

### Development

The following command will start the server in development mode:

```bash
npm run dev
```

### Tests

Running the tests requires test dependencies to be installed. The following command will install Neo4j :

```bash
docker run --publish=7475:7474 --publish=7688:7687 --env=NEO4J_AUTH=none -e NEO4J_apoc_export_file_enabled=true -e NEO4J_apoc_import_file_enabled=true -e NEO4J_apoc_import_file_use__neo4j__config=true -e NEO4JLABS_PLUGINS=\[\"apoc\"\]  neo4j:5-community
```

The 7475 port is only intended to allow you to check test behaviour through the Neo4j browser.
The 7688 port is the one used by the test suite to connect to the Neo4j instance.

The following command will run the tests:

```bash
npm run test
```