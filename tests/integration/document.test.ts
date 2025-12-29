import { createTestServer, runCypherFile } from "../setup";

type SourcePerson = {
  uid: string;
  name: string;
  source: string;
  source_identifier: string;
};

type SourceContribution = {
  role: string;
  contributor: SourcePerson;
};

type SourceJournal = {
  uid: string;
  source: string;
  source_identifier: string;
  titles: string[];
  publisher: string;
};

type SourceIssue = {
  issued_by: SourceJournal;
  source: string;
  source_identifier: string;
};
type SourceRecord = {
  uid: string;
  url: string;
  document_types: string[];
  issued: string;
  harvester: string;
  titles: { language: string; value: string }[];
  hal_collection_codes?: string[] | null;
  hal_submit_type?: "file" | "notice" | "annex" | null;
  published_in: SourceIssue;
  has_contributions: SourceContribution[];
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
                      document_types
                      issued
                      has_contributions {
                        role
                        contributor {
                            uid
                            name
                            source
                            source_identifier
                        }
                      }
                      harvester
                      hal_collection_codes
                      hal_submit_type
                      published_in {
                        issued_by {
                            uid
                            source
                            source_identifier
                            titles
                            publisher
                        }
                        source
                        source_identifier
                      }
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
  expect(document?.recorded_by).toHaveLength(2);

  const scanrRecord = document?.recorded_by.find(
    (r) => r.uid === "scanr-doi10.3847/1538-4357/ad0cc0",
  );
  expect(scanrRecord?.issued).toEqual("2012-09-19T00:00:00.000Z");
  expect(scanrRecord?.document_types).toHaveLength(2);
  expect(scanrRecord?.document_types).toEqual(["Book", "Document"]);
  expect(scanrRecord?.harvester).toBe("ScanR");
  expect(scanrRecord?.hal_collection_codes).toBeNull();
  expect(scanrRecord?.hal_submit_type).toBeNull();

  expect(scanrRecord?.uid).toEqual("scanr-doi10.3847/1538-4357/ad0cc0");
  expect(scanrRecord?.url).toEqual(
    "https://scanr.enseignementsup-recherche.gouv.fr/publications/10.3847/1538-4357/ad0cc0",
  );
  expect(scanrRecord?.harvester).toEqual("ScanR");
  expect(scanrRecord?.titles).toHaveLength(2);
  const recordedByTitles = scanrRecord?.titles;
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
  const contributions = scanrRecord?.has_contributions;
  if (contributions === undefined) {
    fail("Expected source contributions");
  }
  expect(contributions).toHaveLength(2);
  // contrib1 = constibution by rle "AUTHOR"
  const contrib1 = contributions.find((c) => c.role === "AUTHOR");
  if (!contrib1) {
    fail("Expected AUTHOR contribution");
  }
  const person1 = contrib1.contributor;
  expect(person1.uid).toEqual("hal-123456");
  expect(person1.name).toEqual("Marie Dupuis");
  expect(person1.source).toEqual("hal");
  expect(person1.source_identifier).toEqual("123456");
  // expect(contributions[1].role).toEqual("THESIS-DIRECTOR");
  const contrib2 = contributions.find((c) => c.role === "THESIS-DIRECTOR");
  expect(contrib2).toBeDefined();
  if (!contrib2) {
    fail("Expected THESIS-DIRECTOR contribution");
  }
  const person2 = contrib2.contributor;
  expect(person2.uid).toEqual("hal-987654");
  expect(person2.name).toEqual("Laurent Dupond");
  expect(person2.source).toEqual("hal");
  expect(person2.source_identifier).toEqual("987654");
  const issue = scanrRecord?.published_in;
  expect(issue?.source).toEqual("ScanR");
  expect(issue?.source_identifier).toEqual("the_astrophysical_journal-ScanR");
  const journal = issue?.issued_by;
  expect(journal?.uid).toEqual(
    "scanr-0004-637X-1538-4357-the_astrophysical_journal-american_astronomical_society-ScanR",
  );
  expect(journal?.source).toEqual("ScanR");
  expect(journal?.source_identifier).toEqual(
    "0004-637X-1538-4357-the_astrophysical_journal-american_astronomical_society-ScanR",
  );
  expect(journal?.publisher).toEqual("American Astronomical Society");
  expect(journal?.titles).toEqual(["The Astrophysical Journal"]);

  const halRecord = document?.recorded_by.find(
    (r) => r.uid === "hal-hal-04234567",
  );
  expect(halRecord?.harvester).toBe("HAL");
  expect(halRecord?.hal_collection_codes).toEqual(["astronomy", "cosmology"]);
  expect(halRecord?.hal_submit_type).toBe("file");

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
