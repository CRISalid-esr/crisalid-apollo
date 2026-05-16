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

type OrganizationUnitWithMemberships = OrganizationUnit & {
  member_ofConnection: {
    edges: OrgMembershipEdge[];
  };
};

type OrganizationUnitsResponse = {
  organizationUnits: OrganizationUnitWithMemberships[];
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
}, 20000);
