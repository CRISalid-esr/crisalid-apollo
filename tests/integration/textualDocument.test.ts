import { createTestServer, runCypherFile } from "../setup";

type SourceRecord = {
  uid: string;
  harvester: string;
  titles: { language: string; value: string }[];
};
type TextualDocument = {
  uid: string;
  titles: { language: string; value: string }[];
  recorded_by: SourceRecord[];
};
type TextualDocumentsResponse = {
  textualDocuments: TextualDocument[];
};

test("Fetch TextualDocument with source records", async () => {
  const server = await createTestServer();
  await runCypherFile("tests/data/textual_document.cypher");

  const GET_TEXTUAL_DOCUMENTS = `
                query {
                  textualDocuments {
                    uid
                    titles {
                      language
                      value
                    }
                    recorded_by {
                      uid
                      harvester
                      titles {
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
  const textualDocumentsData = result.data as TextualDocumentsResponse;
  expect(textualDocumentsData?.textualDocuments).toHaveLength(1);
  const textualDocument: TextualDocument =
    textualDocumentsData?.textualDocuments[0];
  if (typeof textualDocument !== "object") {
    fail("Expected object");
  }
  expect(textualDocument?.uid).toEqual("doc1");
  expect(textualDocument?.titles).toHaveLength(2);
  const titles = textualDocument?.titles;
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
  expect(textualDocument?.recorded_by).toHaveLength(1);
  const recordedBy = textualDocument?.recorded_by[0];
  expect(recordedBy?.uid).toEqual("scanr-doi10.3847/1538-4357/ad0cc0");
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
});
