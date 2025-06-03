import { createTestServer, runCypherFile } from "../setup";

type Person = {
  uid: string;
  display_name: string;
  identifiers: { type: string; value: string }[];
  names: PersonName[];
  membershipsConnection: {
    edges: {
      properties: {
        start_date: string;
        end_date: string;
        position_code: string;
      };
      node: Organisation;
    }[];
  };
  employmentsConnection: {
    edges: {
      properties: {
        start_date: string;
        end_date: string;
        position_code: string;
      };
      node: Organisation;
    }[];
  };
};
type PersonName = {
  first_names: Literal[];
  last_names: Literal[];
};
type Literal = {
  value: string;
  language: string;
};
type Organisation = {
  uid: string;
  acronym: string;
  identifiers: { type: string; value: string }[];
  names: Literal[];
  types: string[];
};
type PeopleResponse = {
  people: Person[];
};

test("Fetch person data", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/graph.cypher");

  const GET_PEOPLE = `
                query People {
                        people {
                          display_name
                          identifiers {
                            type
                            value
                          }
                          membershipsConnection {
                            edges {
                              properties {
                                start_date
                                end_date
                                position_code
                              }
                              node {
                                acronym
                                identifiers {
                                  type
                                  value
                                }
                                names {
                                  language
                                  value
                                }
                                types
                                uid
                              }
                            }
                          }
                          employmentsConnection {
                            edges {
                              properties {
                                start_date
                                end_date
                                position_code
                              }
                              node {
                                acronym
                                identifiers {
                                  type
                                  value
                                }
                                names {
                                  language
                                  value
                                }
                                types
                                uid
                              }
                            }
                          }
                          names {
                            first_names {
                              language
                              value
                            }
                            last_names {
                              language
                              value
                            }
                          }
                        }
                      }
              `;
  const res = await server.executeOperation({ query: GET_PEOPLE });
  const body = res.body;
  if (body?.kind !== "single") {
    fail("Expected single result");
  }
  console.log("RAW RESPONSE:", JSON.stringify(body, null, 2));
  const result = body.singleResult;
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2));
  }
  expect(result.errors).toBeUndefined();
  const personData = result.data as PeopleResponse;
  expect(personData?.people).toHaveLength(1);
  const person: Person = personData?.people[0];
  if (typeof person !== "object") {
    fail("Expected object");
  }
  expect(person?.display_name).toBeNull();
  expect(person?.identifiers).toHaveLength(3);
  const identifiers = person?.identifiers;
  expect(identifiers).toContainEqual({
    type: "orcid",
    value: "0000-0001-2345-6789",
  });
  expect(identifiers).toContainEqual({
    type: "idref",
    value: "012345678",
  });
  expect(identifiers).toContainEqual({
    type: "local",
    value: "jdurand@univ-domain.edu",
  });
  expect(person?.membershipsConnection.edges).toHaveLength(1);
  const membership = person?.membershipsConnection.edges[0];
  expect(membership.properties.start_date).toBeNull();
  expect(membership.properties.end_date).toBeNull();
  expect(membership.properties.position_code).toBeNull();
  const node = membership.node;
  expect(node.acronym).toEqual("LRA");
  expect(node.identifiers).toHaveLength(1);
  expect(node.identifiers).toContainEqual({
    type: "local",
    value: "123456",
  });
  expect(node.names).toHaveLength(1);
  expect(node.names).toContainEqual({
    language: "fr",
    value: "Laboratoire de recherche en astrophysique",
  });
  expect(node.types).toHaveLength(2);
  expect(node.types).toContainEqual("Organisation");
  expect(node.types).toContainEqual("ResearchStructure");
  expect(node.uid).toEqual("local-123456");
  expect(person?.employmentsConnection.edges).toHaveLength(1);
  const employment = person?.employmentsConnection.edges[0];
  expect(employment.properties.start_date).toBeNull();
  expect(employment.properties.end_date).toBeNull();
  expect(employment.properties.position_code).toEqual("PR");
  const employmentNode = employment.node;
  expect(employmentNode.acronym).toBeNull();
  expect(employmentNode.identifiers).toHaveLength(1);
  expect(employmentNode.identifiers).toContainEqual({
    type: "UAI",
    value: "02345",
  });
  expect(employmentNode.names).toHaveLength(1);
  expect(employmentNode.names).toContainEqual({
    language: "fr",
    value: "Université de Paris",
  });
  expect(employmentNode.types).toHaveLength(2);
  expect(employmentNode.types).toContainEqual("Organisation");
  expect(employmentNode.types).toContainEqual("Institution");
  expect(employmentNode.uid).toEqual("local-123456");
  expect(person?.names).toHaveLength(2);
  const names = person?.names;
  expect(names).toContainEqual({
    first_names: [
      {
        language: "fr",
        value: "Jeannette",
      },
    ],
    last_names: [
      {
        language: "fr",
        value: "Dupont",
      },
    ],
  });
  expect(names).toContainEqual({
    first_names: [
      {
        language: "fr",
        value: "Jeannette",
      },
    ],
    last_names: [
      {
        language: "fr",
        value: "Durand",
      },
    ],
  });
});
