import { createTestServer, runCypherFile } from "../setup";

type SourceRecord = {
  uid: string;
  url: string;
  harvester: string;
  titles: { language: string; value: string }[];
};
type Document = {
  uid: string;
  document_type: string;
  publication_date: string;
  publication_date_start: string;
  publication_date_end: string;
  titles: { language: string; value: string }[];
  publishedInConnection: {
    edges: {
      properties: {
        volume: string;
        issue: string;
        pages: string;
      };
      node: {
        types: string[];
        uid: string;
        publisher: string;
        titles: string[];
        identifiers: { type: string; value: string; format: string | null }[];
      };
    }[];
  };
  recorded_by: SourceRecord[];
  has_subjects: {
    uid: string;
    pref_labels: { language: string; value: string }[];
    alt_labels: { language: string; value: string }[];
  }[];
};
type DocumentsResponse = {
  documents: Document[];
};

test("Fetch TextualDocument with source records", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/graph.cypher");

  const GET_DOCUMENTS = `
                query {
                  documents {
                    uid
                    document_type
                    publication_date
                    publication_date_start
                    publication_date_end
                    titles {
                      language
                      value
                    }
                    has_subjects {
                      uid
                      pref_labels {
                        language
                        value
                      }
                      alt_labels {
                        language
                        value
                      }
                    }                    
                    publishedInConnection {
                      edges {
                        properties {
                          volume
                          issue
                          pages
                        }
                        node {
                          types
                          uid
                          publisher
                          titles
                          identifiers {
                            type
                            value
                            format
                          }
                        }
                      }
                    }
                    recorded_by {
                      uid
                      url
                      harvester
                      titles {
                          language
                          value
                      }
                    }
                  }
                }
              `;
  const res = await server.executeOperation({ query: GET_DOCUMENTS });
  const body = res.body;
  if (body?.kind !== "single") {
    fail("Expected single result");
  }
  const result = body.singleResult;
  expect(result.errors).toBeUndefined();
  const documentsData = result.data as DocumentsResponse;
  expect(documentsData?.documents).toHaveLength(1);
  const document: Document = documentsData?.documents[0];
  if (typeof document !== "object") {
    fail("Expected object");
  }
  expect(document?.uid).toEqual("doc1");

  expect(document?.document_type).toEqual("JournalArticle");
  expect(document?.publication_date).toEqual("2012-09-19");
  expect(document?.publication_date_start).toEqual("2012-09-19T00:00:00.000Z");
  expect(document?.publication_date_end).toEqual("2012-09-19T23:59:59.000Z");
  expect(document?.titles).toHaveLength(2);
  const titles = document?.titles;
  expect(titles).toContainEqual({
    language: "en",
    value:
      "All We Are Is Dust in the WIM: Constraints on Dust Properties in the Milky Way’s Warm Ionized Medium",
  });
  expect(titles).toContainEqual({
    language: "fr",
    value:
      "Nous ne sommes que de la poussière dans le WIM : contraintes sur " +
      "les propriétés de la poussière dans le milieu ionisé chaud de la Voie Lactée",
  });
  expect(document?.publishedInConnection.edges).toHaveLength(1);
  const publishedInEdge = document?.publishedInConnection.edges[0];
  expect(publishedInEdge?.properties.volume).toEqual("823");
  expect(publishedInEdge?.properties.issue).toEqual("1");
  expect(publishedInEdge?.properties.pages).toEqual("1–20");
  expect(publishedInEdge?.node?.types).toHaveLength(1);
  expect(publishedInEdge?.node?.types).toContainEqual("Journal");
  expect(publishedInEdge?.node?.uid).toEqual("journal-0004-637X");
  expect(publishedInEdge?.node?.publisher).toEqual(
    "American Astronomical Society",
  );
  expect(publishedInEdge?.node?.titles).toHaveLength(1);
  expect(publishedInEdge?.node?.titles).toContainEqual(
    "The Astrophysical Journal",
  );
  expect(publishedInEdge?.node?.identifiers).toHaveLength(3);
  const identifiers = publishedInEdge?.node?.identifiers;
  expect(identifiers).toContainEqual({
    type: "issn",
    value: "3478-4357",
    format: null,
  });
  expect(identifiers).toContainEqual({
    type: "issn",
    value: "1538-4357",
    format: "Online",
  });
  expect(identifiers).toContainEqual({
    type: "issn",
    value: "0004-637X",
    format: "Print",
  });
  expect(document?.recorded_by).toBeDefined();
  expect(document?.recorded_by).toHaveLength(1);
  const recordedBy = document?.recorded_by[0];
  expect(recordedBy?.uid).toEqual("scanr-doi10.3847/1538-4357/ad0cc0");
  expect(recordedBy?.url).toEqual(
    "https://scanr.enseignementsup-recherche.gouv.fr/publications/10.3847/1538-4357/ad0cc0",
  );
  expect(recordedBy?.harvester).toEqual("ScanR");
  expect(recordedBy?.titles).toHaveLength(2);
  const recordedByTitles = recordedBy?.titles;
  expect(recordedByTitles).toContainEqual({
    language: "en",
    value:
      "All We Are Is Dust in the WIM: Constraints on Dust Properties in the Milky Way’s Warm Ionized Medium",
  });
  expect(recordedByTitles).toContainEqual({
    language: "fr",
    value:
      "Nous ne sommes que de la poussière dans le WIM : contraintes sur " +
      "les propriétés de la poussière dans le milieu ionisé chaud de la Voie Lactée",
  });
  expect(document?.has_subjects).toHaveLength(3);
  const subjects = document?.has_subjects;
  expect(subjects).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        uid: "http://www.idref.fr/02734004x/id",
        pref_labels: expect.arrayContaining([
          { language: null, value: "Analyse des données" },
        ]),
        alt_labels: expect.arrayContaining([]),
      }),
      expect.objectContaining({
        uid: "http://www.idref.fr/027818055/id",
        pref_labels: expect.arrayContaining([
          { language: "fr", value: "Matière interstellaire" },
        ]),
        alt_labels: expect.arrayContaining([
          { language: null, value: "Milieu interstellaire" },
        ]),
      }),
    ]),
  );

  expect(subjects).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        alt_labels: expect.arrayContaining([
          { language: "en", value: "resolution" },
          { language: "en", value: "pixel count" },
        ]),
        pref_labels: expect.arrayContaining([
          { language: "en", value: "image resolution" },
          { language: "fr", value: "résolution numérique" },
        ]),
        uid: "http://www.wikidata.org/entity/Q210521",
      }),
    ]),
  );
});
