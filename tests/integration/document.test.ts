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
  expect(subjects).toContainEqual({
    uid: "http://www.idref.fr/02734004x/id",
    pref_labels: [{ language: null, value: "Analyse des données" }],
    alt_labels: [],
  });
  expect(subjects).toContainEqual({
    alt_labels: [{ language: null, value: "Milieu interstellaire" }],
    pref_labels: [{ language: "fr", value: "Matière interstellaire" }],
    uid: "http://www.idref.fr/027818055/id",
  });
  expect(subjects).toContainEqual({
    alt_labels: [
      { language: "en", value: "resolution" },
      { language: "en", value: "pixel count" },
    ],
    pref_labels: [
      { language: "en", value: "image resolution" },
      { language: "fr", value: "résolution numérique" },
    ],
    uid: "http://www.wikidata.org/entity/Q210521",
  });
});
