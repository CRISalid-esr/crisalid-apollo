import { createTestServer, runCypherFile } from "../setup";

type Literal = {
  value: string;
  language: string;
};

type OrganizationUnit = {
  uid: string;
  generic_type: string;
  national_type: string | null;
  long_labels: Literal[];
  short_labels: Literal[];
  types: string[];
};

type OrgMembershipEdge = {
  properties: {
    position: string | null;
    start_date: string | null;
    end_date: string | null;
  };
  node: OrganizationUnit;
};

type PartOfEdge = {
  properties: {
    start_date: string | null;
    end_date: string | null;
  };
  node: OrganizationUnit;
};

type OrganizationUnitWithRelationships = OrganizationUnit & {
  member_ofConnection: { edges: OrgMembershipEdge[] };
  part_ofConnection: { edges: PartOfEdge[] };
};

type OrganizationUnitsResponse = {
  organizationUnits: OrganizationUnitWithRelationships[];
};

test("ResearchUnit is member_of Institution with position and start_date", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/graph.cypher");

  const QUERY = `
    query {
      organizationUnits(where: { generic_type: "unit" }) {
        uid
        generic_type
        national_type
        long_labels { language value }
        short_labels { language value }
        types
        member_ofConnection {
          edges {
            properties {
              position
              start_date
              end_date
            }
            node {
              uid
              generic_type
              long_labels { language value }
              types
            }
          }
        }
        part_ofConnection {
          edges {
            properties {
              start_date
              end_date
            }
            node {
              uid
              generic_type
              national_type
              long_labels { language value }
              types
              part_ofConnection {
                edges {
                  properties {
                    start_date
                    end_date
                  }
                  node {
                    uid
                    generic_type
                    long_labels { language value }
                    types
                  }
                }
              }
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
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2));
  }
  expect(result.errors).toBeUndefined();

  const data = result.data as OrganizationUnitsResponse;

  expect(data.organizationUnits).toHaveLength(1);

  const unit = data.organizationUnits[0];
  expect(unit.uid).toBe("local-123456");
  expect(unit.generic_type).toBe("unit");
  expect(unit.national_type).toBe("UMR");
  expect(unit.types).toContain("OrganizationUnit");
  expect(unit.types).toContain("Unit");
  expect(unit.types).toContain("ResearchUnit");

  expect(unit.member_ofConnection.edges).toHaveLength(1);
  const edge = unit.member_ofConnection.edges[0];

  expect(edge.properties.position).toBe("main_supervision");
  expect(edge.properties.start_date).not.toBeNull();
  expect(edge.properties.end_date).toBeNull();

  const institution = edge.node;
  expect(institution.uid).toBe("uai-02345");
  expect(institution.generic_type).toBe("institution");
  expect(institution.types).toContain("OrganizationUnit");
  expect(institution.types).toContain("Institution");
  expect(institution.long_labels).toContainEqual({
    language: "fr",
    value: "Université de Paris",
  });

  // PART_OF: ResearchUnit -> InstitutionSubdivision -> Institution
  expect(unit.part_ofConnection.edges).toHaveLength(1);
  const partOfEdge = unit.part_ofConnection.edges[0];
  expect(partOfEdge.properties.start_date).not.toBeNull();
  expect(partOfEdge.properties.end_date).toBeNull();

  const fac = partOfEdge.node;
  expect(fac.uid).toBe("local-FAC-SCI-001");
  expect(fac.generic_type).toBe("institution_subdivision");
  expect(fac.national_type).toBe("FAC");
  expect(fac.types).toContain("OrganizationUnit");
  expect(fac.types).toContain("InstitutionSubdivision");
  expect(fac.long_labels).toContainEqual({ language: "fr", value: "Faculté des sciences" });
  expect(fac.long_labels).toContainEqual({ language: "en", value: "Science faculty" });

  expect(fac.part_ofConnection.edges).toHaveLength(1);
  const facPartOfEdge = fac.part_ofConnection.edges[0];
  expect(facPartOfEdge.properties.start_date).not.toBeNull();
  expect(facPartOfEdge.properties.end_date).toBeNull();

  const facParent = facPartOfEdge.node;
  expect(facParent.uid).toBe("uai-02345");
  expect(facParent.generic_type).toBe("institution");
  expect(facParent.types).toContain("OrganizationUnit");
  expect(facParent.types).toContain("Institution");
}, 20000);
