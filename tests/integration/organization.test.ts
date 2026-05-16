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
  local_types: Literal[];
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
  node: OrganizationUnit & {
    part_ofConnection: { edges: PartOfEdge[] };
  };
};

type OrganizationUnitWithRelationships = OrganizationUnit & {
  member_ofConnection: { edges: OrgMembershipEdge[] };
  part_ofConnection: { edges: PartOfEdge[] };
};

type OrganizationUnitsResponse = {
  organizationUnits: OrganizationUnitWithRelationships[];
};

test("ResearchUnit relationships: member_of and part_of", async () => {
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
        local_types { language value }
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
              national_type
              long_labels { language value }
              local_types { language value }
              identifiers { type value }
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
              local_types { language value }
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

  // MEMBER_OF: ResearchUnit -> Institution (main_supervision) + ResearchUnit -> Department
  expect(unit.member_ofConnection.edges).toHaveLength(2);

  const memberOfInstitution = unit.member_ofConnection.edges.find(
    (e) => e.node.uid === "uai-02345"
  );
  expect(memberOfInstitution).toBeDefined();
  expect(memberOfInstitution!.properties.position).toBe("main_supervision");
  expect(memberOfInstitution!.properties.start_date).not.toBeNull();
  expect(memberOfInstitution!.properties.end_date).toBeNull();
  expect(memberOfInstitution!.node.generic_type).toBe("institution");
  expect(memberOfInstitution!.node.types).toContain("Institution");
  expect(memberOfInstitution!.node.identifiers).toContainEqual({ type: "uai", value: "02345" });
  expect(memberOfInstitution!.node.identifiers).toContainEqual({ type: "ror", value: "https://ror.org/0etdup01x" });

  const memberOfDept = unit.member_ofConnection.edges.find(
    (e) => e.node.uid === "local-DEPT-PHY-001"
  );
  expect(memberOfDept).toBeDefined();
  expect(memberOfDept!.properties.position).toBeNull();
  expect(memberOfDept!.properties.start_date).not.toBeNull();
  expect(memberOfDept!.properties.end_date).toBeNull();
  expect(memberOfDept!.node.generic_type).toBe("institution_subdivision");
  expect(memberOfDept!.node.types).toContain("InstitutionSubdivision");
  expect(memberOfDept!.node.long_labels).toContainEqual({
    language: "fr",
    value: "Département de physique",
  });
  expect(memberOfDept!.node.long_labels).toContainEqual({
    language: "en",
    value: "Physics Department",
  });
  expect(memberOfDept!.node.local_types).toContainEqual({
    language: "fr",
    value: "Département",
  });
  expect(memberOfDept!.node.local_types).toContainEqual({
    language: "en",
    value: "Department",
  });
  expect(memberOfDept!.node.identifiers).toContainEqual({ type: "local", value: "DEPT-PHY-001" });
  expect(memberOfDept!.node.identifiers).toContainEqual({ type: "ror", value: "https://ror.org/0deptph1x" });

  // PART_OF: ResearchUnit -> Faculty only
  expect(unit.part_ofConnection.edges).toHaveLength(1);

  const partOfFac = unit.part_ofConnection.edges[0];
  expect(partOfFac.node.uid).toBe("local-FAC-SCI-001");
  expect(partOfFac.properties.start_date).not.toBeNull();
  expect(partOfFac.properties.end_date).toBeNull();
  expect(partOfFac.node.generic_type).toBe("institution_subdivision");
  expect(partOfFac.node.national_type).toBe("FAC");
  expect(partOfFac.node.types).toContain("InstitutionSubdivision");
  expect(partOfFac.node.long_labels).toContainEqual({
    language: "fr",
    value: "Faculté des sciences",
  });
  expect(partOfFac.node.long_labels).toContainEqual({
    language: "en",
    value: "Science faculty",
  });
  expect(partOfFac.node.part_ofConnection.edges).toHaveLength(1);
  expect(partOfFac.node.part_ofConnection.edges[0].node.uid).toBe("uai-02345");
}, 20000);

test("Institution is member_of EPE institution", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/graph.cypher");

  const QUERY = `
    query {
      organizationUnits(where: { uid: "uai-02345" }) {
        uid
        generic_type
        national_type
        long_labels { language value }
        identifiers { type value }
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
              national_type
              long_labels { language value }
              identifiers { type value }
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

  const institution = data.organizationUnits[0];
  expect(institution.uid).toBe("uai-02345");
  expect(institution.generic_type).toBe("institution");
  expect(institution.long_labels).toContainEqual({
    language: "fr",
    value: "Université Étienne Dupond",
  });
  expect(institution.identifiers).toContainEqual({ type: "uai", value: "02345" });
  expect(institution.identifiers).toContainEqual({ type: "ror", value: "https://ror.org/0etdup01x" });

  expect(institution.member_ofConnection.edges).toHaveLength(1);
  const edge = institution.member_ofConnection.edges[0];
  expect(edge.properties.start_date).not.toBeNull();
  expect(edge.properties.end_date).toBeNull();
  expect(edge.properties.position).toBeNull();

  const epe = edge.node;
  expect(epe.uid).toBe("uai-07890");
  expect(epe.generic_type).toBe("institution");
  expect(epe.national_type).toBe("EPE");
  expect(epe.types).toContain("OrganizationUnit");
  expect(epe.types).toContain("Institution");
  expect(epe.long_labels).toContainEqual({
    language: "fr",
    value: "Université Paris Sud-Ouest",
  });
  expect(epe.identifiers).toContainEqual({ type: "uai", value: "07890" });
  expect(epe.identifiers).toContainEqual({ type: "ror", value: "https://ror.org/0parso01x" });
}, 20000);
