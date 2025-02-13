CREATE (p:Person {uid: 'local-jdurand@univ-domain.edu'})

CREATE (i1:AgentIdentifier {type: 'local', value: 'jdurand@univ-domain.edu'})
CREATE (i2:AgentIdentifier {type: 'idref', value: '012345678'})
CREATE (i3:AgentIdentifier {type: 'orcid', value: '0000-0001-2345-6789'})

MERGE (p)-[:HAS_IDENTIFIER]->(i1)
MERGE (p)-[:HAS_IDENTIFIER]->(i2)
MERGE (p)-[:HAS_IDENTIFIER]->(i3)

CREATE (rs:ResearchStructure {uid: 'local-123456'})
CREATE (rsi1:AgentIdentifier {type: 'local', value: '123456'})
CREATE (rsn:Literal {language: 'fr', value: 'Laboratoire de recherche en astrophysique'})

MERGE (rs)-[:HAS_IDENTIFIER]->(rsi1)
MERGE (rs)-[:HAS_NAME]->(rsn)

MERGE (p)-[:MEMBER_OF]->(rs)

CREATE (c1:Concept {uid: 'http://www.idref.fr/02734004x/id', uri: 'http://www.idref.fr/02734004x/id'})
CREATE (c1pl1:Literal {value: 'Analyse des données'})

MERGE (c1)-[:HAS_PREF_LABEL]->(c1pl1)

CREATE (c2:Concept {uid: 'http://www.idref.fr/027818055/id', uri: 'http://www.idref.fr/027818055/id'})
CREATE (c2pl1:Literal {language: 'fr', value: 'Matière interstellaire'})
CREATE (c2al1:Literal {value: 'Milieu interstellaire'})

MERGE (c2)-[:HAS_PREF_LABEL]->(c2pl1)
MERGE (c2)-[:HAS_ALT_LABEL]->(c2al1)

CREATE (c3:Concept {uid: 'http://www.wikidata.org/entity/Q210521', uri: 'http://www.wikidata.org/entity/Q210521'})
CREATE (c3pl1:Literal {language: 'fr', value: 'résolution numérique'})
CREATE (c3pl2:Literal {language: 'en', value: 'image resolution'})

CREATE (c3al1:Literal {language: 'en', value: 'pixel count'})
CREATE (c3al2:Literal {language: 'en', value: 'resolution'})

MERGE (c3)-[:HAS_PREF_LABEL]->(c3pl1)
MERGE (c3)-[:HAS_PREF_LABEL]->(c3pl2)
MERGE (c3)-[:HAS_ALT_LABEL]->(c3al1)
MERGE (c3)-[:HAS_ALT_LABEL]->(c3al2)


CREATE (pi1:PublicationIdentifier {type: 'doi', value: '10.3847/1538-4357/ad0cc0'})

CREATE (pn1:PersonName)
CREATE (pn1fn:Literal {language: 'fr', value: 'Jeannette'})
CREATE (pn1ln:Literal {language: 'fr', value: 'Durand'})

MERGE (pn1)-[:HAS_FIRST_NAME]->(pn1fn)
MERGE (pn1)-[:HAS_LAST_NAME]->(pn1ln)

CREATE (pn2:PersonName)
CREATE (pn2fn:Literal {language: 'fr', value: 'Jeannette'})
CREATE (pn2ln:Literal {language: 'fr', value: 'Dupont'})

MERGE (pn2)-[:HAS_FIRST_NAME]->(pn2fn)
MERGE (pn2)-[:HAS_LAST_NAME]->(pn2ln)

MERGE (p)-[:HAS_NAME]->(pn1)
MERGE (p)-[:HAS_NAME]->(pn2)

CREATE(t1:Literal {language: 'en',
                   value:    'All We Are Is Dust in the WIM: Constraints on Dust Properties in the Milky Way’s Warm Ionized Medium'})
CREATE(t2:Literal {language: 'fr',
                   value:    'Nous ne sommes que de la poussière dans le WIM : contraintes sur les propriétés de la poussière dans le milieu ionisé chaud de la Voie Lactée'})


CREATE (j1:SourceJournal {
  uid:               'scanr-0004-637X-1538-4357-the_astrophysical_journal-american_astronomical_society-ScanR',
  publisher:         'American Astronomical Society',
  titles:            ['The Astrophysical Journal'],
  source:            'ScanR',
  source_identifier: '0004-637X-1538-4357-the_astrophysical_journal-american_astronomical_society-ScanR'
})


CREATE (ji1:JournalIdentifier {type: 'issn', value: '0004-637X'})
CREATE (ji2:JournalIdentifier {type: 'issn', value: '1538-4357'})

MERGE (j1)-[:HAS_IDENTIFIER]->(ji1)
MERGE (j1)-[:HAS_IDENTIFIER]->(ji2)

CREATE (si:SourceIssue {
  number:            [],
  source:            'ScanR',
  titles:            [],
  source_identifier: 'the_astrophysical_journal-ScanR'
})

CREATE (s:SourceRecord {
  harvester:         'ScanR',
  uid:               'scanr-doi10.3847/1538-4357/ad0cc0',
  source_identifier: 'doi10.3847/1538-4357/ad0cc0'
})

MERGE (s)-[:HAS_TITLE]->(t1)
MERGE (s)-[:HAS_TITLE]->(t2)
MERGE (s)-[:HAS_SUBJECT]->(c1)
MERGE (s)-[:HAS_SUBJECT]->(c2)
MERGE (s)-[:HAS_SUBJECT]->(c3)
MERGE (s)-[:HAS_IDENTIFIER]->(pi1)
MERGE (s)-[:PUBLISHED_IN]->(si)
MERGE (si)-[:ISSUED_IN]->(j1)
MERGE (s)-[:HARVESTED_FOR]->(p)

CREATE (doc:Document {uid: 'doc1',
                             document_type: 'JournalArticle',
                             publication_date: '2012-09-19',
                             publication_date_start: '2012-09-19T00:00:00Z',
                             publication_date_end: '2012-09-19T23:59:59Z'})
CREATE(title1:Literal {language: 'en',
                       value:    'All We Are Is Dust in the WIM: Constraints on Dust Properties in the Milky Way’s Warm Ionized Medium'})
CREATE(title2:Literal {language: 'fr',
                       value:    'Nous ne sommes que de la poussière dans le WIM : contraintes sur les propriétés de la poussière dans le milieu ionisé chaud de la Voie Lactée'})
CREATE (doc)-[:HAS_TITLE]->(title1)
CREATE (doc)-[:HAS_TITLE]->(title2)
CREATE (doc)-[:RECORDED_BY]->(s)
