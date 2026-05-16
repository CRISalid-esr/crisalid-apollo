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
      node: OrganizationUnit;
    }[];
  };
  employmentsConnection: {
    edges: {
      properties: {
        start_date: string;
        end_date: string;
        position_code: string;
      };
      node: OrganizationUnit;
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
type OrganizationUnit = {
  uid: string;
  generic_type: string;
  national_type: string | null;
  identifiers: { type: string; value: string }[];
  long_labels: Literal[];
  short_labels: Literal[];
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
                                generic_type
                                national_type
                                identifiers {
                                  type
                                  value
                                }
                                long_labels {
                                  language
                                  value
                                }
                                short_labels {
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
                                generic_type
                                national_type
                                identifiers {
                                  type
                                  value
                                }
                                long_labels {
                                  language
                                  value
                                }
                                short_labels {
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
  expect(person?.membershipsConnection.edges).toHaveLength(2);

  const researchUnitMembership = person?.membershipsConnection.edges.find(
    (e) => e.node.uid === "local-123456"
  );
  expect(researchUnitMembership).toBeDefined();
  expect(researchUnitMembership!.properties.start_date).toBeNull();
  expect(researchUnitMembership!.properties.end_date).toBeNull();
  expect(researchUnitMembership!.properties.position_code).toBeNull();
  const node = researchUnitMembership!.node;
  expect(node.generic_type).toEqual("unit");
  expect(node.national_type).toEqual("UMR");
  expect(node.identifiers).toHaveLength(1);
  expect(node.identifiers).toContainEqual({ type: "local", value: "123456" });
  expect(node.long_labels).toHaveLength(1);
  expect(node.long_labels).toContainEqual({
    language: "fr",
    value: "Laboratoire de recherche en astrophysique",
  });
  expect(node.short_labels).toHaveLength(1);
  expect(node.short_labels).toContainEqual({ language: "fr", value: "LRA" });
  expect(node.types).toHaveLength(3);
  expect(node.types).toContainEqual("OrganizationUnit");
  expect(node.types).toContainEqual("Unit");
  expect(node.types).toContainEqual("ResearchUnit");

  const deptMembership = person?.membershipsConnection.edges.find(
    (e) => e.node.uid === "local-DEPT-PHY-001"
  );
  expect(deptMembership).toBeDefined();
  expect(deptMembership!.node.generic_type).toEqual("institution_subdivision");
  expect(deptMembership!.node.types).toContainEqual("InstitutionSubdivision");
  expect(deptMembership!.node.long_labels).toContainEqual({
    language: "fr",
    value: "Département de physique",
  });
  expect(person?.employmentsConnection.edges).toHaveLength(1);
  const employment = person?.employmentsConnection.edges[0];
  expect(employment.properties.start_date).toBeNull();
  expect(employment.properties.end_date).toBeNull();
  expect(employment.properties.position_code).toEqual("PR");
  const employmentNode = employment.node;
  expect(employmentNode.generic_type).toEqual("institution");
  expect(employmentNode.national_type).toBeNull();
  expect(employmentNode.identifiers).toHaveLength(1);
  expect(employmentNode.identifiers).toContainEqual({
    type: "uai",
    value: "02345",
  });
  expect(employmentNode.long_labels).toHaveLength(1);
  expect(employmentNode.long_labels).toContainEqual({
    language: "fr",
    value: "Université Étienne Dupond",
  });
  expect(employmentNode.short_labels).toHaveLength(0);
  expect(employmentNode.types).toHaveLength(2);
  expect(employmentNode.types).toContainEqual("OrganizationUnit");
  expect(employmentNode.types).toContainEqual("Institution");
  expect(employmentNode.uid).toEqual("uai-02345");
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
}, 20000);
