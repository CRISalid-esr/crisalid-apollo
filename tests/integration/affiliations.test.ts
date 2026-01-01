import { createTestServer, runCypherFile } from "../setup";

type AgentIdentifier = { type: string; value: string };

type AuthorityOrganization = {
  uid: string;
  display_names: string[];
  identifiers: AgentIdentifier[];
};

type Contribution = {
  uid: string;
  roles: string[];
  affiliations: AuthorityOrganization[];
};

type Document = {
  uid: string;
  has_contributions: Contribution[];
};

type Response = { documents: Document[] };

test("Fetch contributions affiliations: can target state or root", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/graph.cypher");

  const QUERY = `
    query {
      documents {
        uid
        has_contributions {
          uid
          roles
          affiliations {
            uid
            display_names
            identifiers {
              type
              value
            }
          }
        }
      }
    }
  `;

  const res = await server.executeOperation({ query: QUERY });
  const body = res.body;
  if (body?.kind !== "single") fail("Expected single result");

  const result = body.singleResult;
  expect(result.errors).toBeUndefined();

  const data = result.data as Response;
  expect(data.documents).toHaveLength(1);

  const doc = data.documents[0];
  expect(doc.uid).toBe("doc1");

  // We created 2 contributions in cypher
  expect(doc.has_contributions).toHaveLength(2);

  const c1 = doc.has_contributions.find((c) => c.uid === "contrib-1");
  const c2 = doc.has_contributions.find((c) => c.uid === "contrib-2");
  expect(c1).toBeDefined();
  expect(c2).toBeDefined();

  // contrib-1 -> STATE
  expect(c1!.affiliations).toHaveLength(1);
  expect(c1!.affiliations[0].uid).toBe("ao-state-1");
  expect(c1!.affiliations[0].display_names).toContain("Université Anonyme");

  // identifiers on state: hal(2001) + idref(123456789)
  const ids1 = c1!.affiliations[0].identifiers;
  expect(ids1).toEqual(
    expect.arrayContaining([
      { type: "hal", value: "2001" },
      { type: "idref", value: "123456789" },
    ]),
  );

  // contrib-2 -> ROOT
  expect(c2!.affiliations).toHaveLength(1);
  expect(c2!.affiliations[0].uid).toBe("ao-root-1");
  expect(c2!.affiliations[0].display_names).toContain("Université Anonyme");

  // identifiers on root: ror only (per cypher)
  const ids2 = c2!.affiliations[0].identifiers;
  expect(ids2).toEqual(
    expect.arrayContaining([
      { type: "ror", value: "https://ror.org/000000000" },
    ]),
  );
}, 20000);
