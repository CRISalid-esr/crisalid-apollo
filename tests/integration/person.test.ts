import { createTestServer, runCypherFile } from "../setup";

type Person = {
  uid: string;
  display_name: string;
  identifiers: { type: string; value: string }[];
  memberships: Organisation[];
  names: PersonName[];
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
  type: string;
};
type PeopleResponse = {
  people: Person[];
};

test("Fetch person data", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/graph.cypher");

  const GET_TEXTUAL_DOCUMENTS = `
                query People {
  people {
    display_name
    identifiers {
      type
      value
    }
    memberships {
      acronym
      identifiers {
        type
        value
      }
      names {
        language
        value
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
  const res = await server.executeOperation({ query: GET_TEXTUAL_DOCUMENTS });
  const body = res.body;
  if (body?.kind !== "single") {
    fail("Expected single result");
  }
  const result = body.singleResult;
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
  expect(person?.memberships).toHaveLength(0);
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
