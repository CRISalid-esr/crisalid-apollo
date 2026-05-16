CREATE (p:Person {uid: 'local-jdurand@univ-domain.edu'})

CREATE (i1:AgentIdentifier {type: 'local', value: 'jdurand@univ-domain.edu'})
CREATE (i2:AgentIdentifier {type: 'idref', value: '012345678'})
CREATE (i3:AgentIdentifier {type: 'orcid', value: '0000-0001-2345-6789'})

MERGE (p)-[:HAS_IDENTIFIER]->(i1)
MERGE (p)-[:HAS_IDENTIFIER]->(i2)
MERGE (p)-[:HAS_IDENTIFIER]->(i3)

CREATE (rs:OrganizationUnit:Unit:ResearchUnit {uid: 'local-123456', generic_type: 'unit', national_type: 'UMR'})
CREATE (rsi1:AgentIdentifier {type: 'local', value: '123456'})
CREATE (rsln1:Literal {language: 'fr', value: 'Laboratoire de recherche en astrophysique', type: 'organization_long_label'})
CREATE (rssn1:Literal {language: 'fr', value: 'LRA', type: 'organization_short_label'})

MERGE (rs)-[:HAS_IDENTIFIER]->(rsi1)
MERGE (rs)-[:HAS_LONG_LABEL]->(rsln1)
MERGE (rs)-[:HAS_SHORT_LABEL]->(rssn1)

CREATE (rsdesc1:TextLiteral {language: 'en', key: 'desc-lra-en', value: 'UMR in astrophysics under main supervision of Université Étienne Dupond and associated supervision of CNRS and École nationale d\'astrophysique, member of the Physics Department.'})
CREATE (rsdesc2:TextLiteral {language: 'fr', key: 'desc-lra-fr', value: 'UMR en astrophysique sous tutelle principale de l\'Université Étienne Dupond et tutelles associées du CNRS et de l\'École nationale d\'astrophysique, membre du Département de physique.'})
MERGE (rs)-[:HAS_DESCRIPTION]->(rsdesc1)
MERGE (rs)-[:HAS_DESCRIPTION]->(rsdesc2)

MERGE (p)-[:MEMBER_OF]->(rs)

CREATE (epe:OrganizationUnit:Institution {uid: 'uai-07890', generic_type: 'institution', national_type: 'EPE'})
CREATE (epeln1:Literal {language: 'fr', value: 'Université Paris Sud-Ouest', type: 'organization_long_label'})
CREATE (epei1:AgentIdentifier {type: 'uai', value: '07890'})
CREATE (epei2:AgentIdentifier {type: 'ror', value: 'https://ror.org/0parso01x'})

MERGE (epe)-[:HAS_LONG_LABEL]->(epeln1)
MERGE (epe)-[:HAS_IDENTIFIER]->(epei1)
MERGE (epe)-[:HAS_IDENTIFIER]->(epei2)

CREATE (epedesc1:TextLiteral {language: 'en', key: 'desc-epe-en', value: 'Établissement public expérimental grouping universities and research institutions in the Paris Sud-Ouest area.'})
CREATE (epedesc2:TextLiteral {language: 'fr', key: 'desc-epe-fr', value: 'Établissement public expérimental regroupant universités et établissements de recherche de la région Paris Sud-Ouest.'})
MERGE (epe)-[:HAS_DESCRIPTION]->(epedesc1)
MERGE (epe)-[:HAS_DESCRIPTION]->(epedesc2)

CREATE (in:OrganizationUnit:Institution {uid: 'uai-02345', generic_type: 'institution'})
CREATE (ini1:AgentIdentifier {type: 'uai', value: '02345'})
CREATE (ini2:AgentIdentifier {type: 'ror', value: 'https://ror.org/0etdup01x'})
CREATE (inn1:Literal {language: 'fr', value: 'Université Étienne Dupond', type: 'organization_long_label'})

MERGE (in)-[:HAS_IDENTIFIER]->(ini1)
MERGE (in)-[:HAS_IDENTIFIER]->(ini2)
MERGE (in)-[:HAS_LONG_LABEL]->(inn1)

CREATE (indesc1:TextLiteral {language: 'en', key: 'desc-in-en', value: 'University member of the Université Paris Sud-Ouest EPE, main supervising institution of the LRA research unit.'})
CREATE (indesc2:TextLiteral {language: 'fr', key: 'desc-in-fr', value: 'Université membre de l\'EPE Université Paris Sud-Ouest, établissement de tutelle principale de l\'unité de recherche LRA.'})
MERGE (in)-[:HAS_DESCRIPTION]->(indesc1)
MERGE (in)-[:HAS_DESCRIPTION]->(indesc2)

MERGE (in)-[:MEMBER_OF {start_date: date('2020-01-01')}]->(epe)

MERGE (p)-[:EMPLOYED_AT {position_code: 'PR'}]->(in)

MERGE (rs)-[:MEMBER_OF {position: 'main_supervision', start_date: date('2000-01-01')}]->(in)

CREATE (dept:OrganizationUnit:InstitutionSubdivision {uid: 'local-DEPT-PHY-001', generic_type: 'institution_subdivision'})
CREATE (deptln1:Literal {language: 'fr', value: 'Département de physique', type: 'organization_long_label'})
CREATE (deptln2:Literal {language: 'en', value: 'Physics Department', type: 'organization_long_label'})
CREATE (deptlt1:Literal {language: 'fr', value: 'Département', type: 'organization_local_type'})
CREATE (deptlt2:Literal {language: 'en', value: 'Department', type: 'organization_local_type'})
CREATE (depti1:AgentIdentifier {type: 'local', value: 'DEPT-PHY-001'})
CREATE (depti2:AgentIdentifier {type: 'ror', value: 'https://ror.org/0deptph1x'})

MERGE (dept)-[:HAS_LONG_LABEL]->(deptln1)
MERGE (dept)-[:HAS_LONG_LABEL]->(deptln2)
MERGE (dept)-[:HAS_LOCAL_TYPE]->(deptlt1)
MERGE (dept)-[:HAS_LOCAL_TYPE]->(deptlt2)
MERGE (dept)-[:HAS_IDENTIFIER]->(depti1)
MERGE (dept)-[:HAS_IDENTIFIER]->(depti2)

CREATE (deptdesc1:TextLiteral {language: 'en', key: 'desc-dept-en', value: 'Physics department of Université Étienne Dupond, part of the Science faculty, hosting the LRA research unit.'})
CREATE (deptdesc2:TextLiteral {language: 'fr', key: 'desc-dept-fr', value: 'Département de physique de l\'Université Étienne Dupond, composante de la Faculté des sciences, accueillant l\'unité LRA.'})
MERGE (dept)-[:HAS_DESCRIPTION]->(deptdesc1)
MERGE (dept)-[:HAS_DESCRIPTION]->(deptdesc2)

MERGE (rs)-[:MEMBER_OF {start_date: date('2000-01-01')}]->(dept)
MERGE (p)-[:MEMBER_OF]->(dept)
MERGE (dept)-[:PART_OF {start_date: date('1995-01-01')}]->(in)

CREATE (fac:OrganizationUnit:InstitutionSubdivision {uid: 'local-FAC-SCI-001', generic_type: 'institution_subdivision', national_type: 'FAC'})
CREATE (facln1:Literal {language: 'fr', value: 'Faculté des sciences', type: 'organization_long_label'})
CREATE (facln2:Literal {language: 'en', value: 'Science faculty', type: 'organization_long_label'})

MERGE (fac)-[:HAS_LONG_LABEL]->(facln1)
MERGE (fac)-[:HAS_LONG_LABEL]->(facln2)

CREATE (facdesc1:TextLiteral {language: 'en', key: 'desc-fac-en', value: 'Science faculty of Université Étienne Dupond, grouping science departments.'})
CREATE (facdesc2:TextLiteral {language: 'fr', key: 'desc-fac-fr', value: 'Faculté des sciences de l\'Université Étienne Dupond, regroupant les départements scientifiques.'})
MERGE (fac)-[:HAS_DESCRIPTION]->(facdesc1)
MERGE (fac)-[:HAS_DESCRIPTION]->(facdesc2)

MERGE (rs)-[:PART_OF {start_date: date('2000-01-01')}]->(fac)
MERGE (fac)-[:PART_OF {start_date: date('1995-01-01')}]->(in)

CREATE (cnrs:OrganizationUnit:Institution {uid: 'uai-CNRS', generic_type: 'institution', national_type: 'EPST'})
CREATE (cnrsln1:Literal {language: 'fr', value: 'Centre national de la recherche scientifique', type: 'organization_long_label'})
CREATE (cnrssn1:Literal {language: 'fr', value: 'CNRS', type: 'organization_short_label'})
CREATE (cnrsi1:AgentIdentifier {type: 'uai', value: '0757581P'})
CREATE (cnrsi2:AgentIdentifier {type: 'ror', value: 'https://ror.org/02feahw73'})

MERGE (cnrs)-[:HAS_LONG_LABEL]->(cnrsln1)
MERGE (cnrs)-[:HAS_SHORT_LABEL]->(cnrssn1)
MERGE (cnrs)-[:HAS_IDENTIFIER]->(cnrsi1)
MERGE (cnrs)-[:HAS_IDENTIFIER]->(cnrsi2)

CREATE (cnrsdesc1:TextLiteral {language: 'en', key: 'desc-cnrs-en', value: 'French national public research organization, associated supervision of the LRA research unit.'})
CREATE (cnrsdesc2:TextLiteral {language: 'fr', key: 'desc-cnrs-fr', value: 'Organisme national de recherche scientifique public, tutelle associée de l\'unité de recherche LRA.'})
MERGE (cnrs)-[:HAS_DESCRIPTION]->(cnrsdesc1)
MERGE (cnrs)-[:HAS_DESCRIPTION]->(cnrsdesc2)

MERGE (rs)-[:MEMBER_OF {position: 'associated_supervision', start_date: date('2000-01-01')}]->(cnrs)

CREATE (ena:OrganizationUnit:Institution {uid: 'uai-ENA-ASTRO', generic_type: 'institution', national_type: 'GE'})
CREATE (enaln1:Literal {language: 'fr', value: "École nationale d'astrophysique", type: 'organization_long_label'})
CREATE (enai1:AgentIdentifier {type: 'uai', value: '0123456A'})
CREATE (enai2:AgentIdentifier {type: 'ror', value: 'https://ror.org/0enastr1x'})

MERGE (ena)-[:HAS_LONG_LABEL]->(enaln1)
MERGE (ena)-[:HAS_IDENTIFIER]->(enai1)
MERGE (ena)-[:HAS_IDENTIFIER]->(enai2)

CREATE (enadesc1:TextLiteral {language: 'en', key: 'desc-ena-en', value: 'National school of astrophysics, associated supervision of the LRA research unit.'})
CREATE (enadesc2:TextLiteral {language: 'fr', key: 'desc-ena-fr', value: "École nationale d'astrophysique, tutelle associée de l'unité de recherche LRA."})
MERGE (ena)-[:HAS_DESCRIPTION]->(enadesc1)
MERGE (ena)-[:HAS_DESCRIPTION]->(enadesc2)

MERGE (rs)-[:MEMBER_OF {position: 'associated_supervision', start_date: date('2005-01-01')}]->(ena)

CREATE (team:OrganizationUnit:Team {uid: 'local-TEAM-ASTRO-001', generic_type: 'team', national_type: 'TEAM'})
CREATE (teamln1:Literal {language: 'fr', value: "Groupe d'astrophysique observationnelle", type: 'organization_long_label'})
CREATE (teamln2:Literal {language: 'en', value: 'Observational astrophysics group', type: 'organization_long_label'})
CREATE (teamlt1:Literal {language: 'fr', value: 'Groupe', type: 'organization_local_type'})
CREATE (teamlt2:Literal {language: 'en', value: 'Group', type: 'organization_local_type'})
CREATE (teamdesc1:TextLiteral {language: 'en', key: 'desc-team-en', value: 'Research team in observational astrophysics, part of the LRA research unit.'})
CREATE (teamdesc2:TextLiteral {language: 'fr', key: 'desc-team-fr', value: "Équipe de recherche en astrophysique observationnelle, composante de l'unité LRA."})

MERGE (team)-[:HAS_LONG_LABEL]->(teamln1)
MERGE (team)-[:HAS_LONG_LABEL]->(teamln2)
MERGE (team)-[:HAS_LOCAL_TYPE]->(teamlt1)
MERGE (team)-[:HAS_LOCAL_TYPE]->(teamlt2)
MERGE (team)-[:HAS_DESCRIPTION]->(teamdesc1)
MERGE (team)-[:HAS_DESCRIPTION]->(teamdesc2)

MERGE (team)-[:PART_OF {start_date: date('2010-01-01')}]->(rs)

CREATE (c1:Concept {uid: 'http://www.idref.fr/02734004x/id', uri: 'http://www.idref.fr/02734004x/id'})
CREATE (c1pl1:Literal {value: 'Analyse des données', language: 'fr'})

MERGE (c1)-[:HAS_PREF_LABEL]->(c1pl1)

CREATE (c2:Concept {uid: 'http://www.idref.fr/027818055/id', uri: 'http://www.idref.fr/027818055/id'})
CREATE (c2pl1:Literal {language: 'fr', value: 'Matière interstellaire'})
CREATE (c2al1:Literal {value: 'Milieu interstellaire', language: 'fr'})

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
CREATE (pi2:PublicationIdentifier {type: 'uri', value: null})

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


CREATE (ji1:JournalIdentifier {type: 'issn', value: '0004-637X', format: 'Print'})
CREATE (ji2:JournalIdentifier {type: 'issn', value: '1538-4357', format: 'Online'})
CREATE (ji3:JournalIdentifier {type: 'issn', value: '3478-4357'})

MERGE (j1)-[:HAS_IDENTIFIER]->(ji1)
MERGE (j1)-[:HAS_IDENTIFIER]->(ji2)
MERGE (j1)-[:HAS_IDENTIFIER]->(ji3)

CREATE (si:SourceIssue {
  number:            [],
  source:            'ScanR',
  titles:            [],
  source_identifier: 'the_astrophysical_journal-ScanR'
})

MERGE (si)-[:ISSUED_BY]->(j1)

CREATE (sp1:SourcePerson {
  uid:               'hal-123456',
  name:              'Marie Dupuis',
  source:            'hal',
  source_identifier: '123456'
})

CREATE (sc1:SourceContribution {
  role: 'AUTHOR'
})

CREATE (sp2:SourcePerson {
  uid:               'hal-987654',
  name:              'Laurent Dupond',
  source:            'hal',
  source_identifier: '987654'
})

CREATE (sc2:SourceContribution {
  role: 'THESIS-DIRECTOR'
})

MERGE (sc1)-[:CONTRIBUTOR]->(sp1)
MERGE (sc2)-[:CONTRIBUTOR]->(sp2)

CREATE (s1:SourceRecord {
  issued:            '2012-09-19T00:00:00Z',
  document_types:    ['Book', 'Document'],
  harvester:         'ScanR',
  url:               'https://scanr.enseignementsup-recherche.gouv.fr/publications/10.3847/1538-4357/ad0cc0',
  uid:               'scanr-doi10.3847/1538-4357/ad0cc0',
  source_identifier: 'doi10.3847/1538-4357/ad0cc0'
})

MERGE (s1)-[:HAS_TITLE]->(t1)
MERGE (s1)-[:HAS_TITLE]->(t2)
MERGE (s1)-[:HAS_SUBJECT]->(c1)
MERGE (s1)-[:HAS_SUBJECT]->(c2)
MERGE (s1)-[:HAS_SUBJECT]->(c3)
MERGE (s1)-[:HAS_IDENTIFIER]->(pi1)
MERGE (s1)-[:HAS_IDENTIFIER]->(pi2)
MERGE (s1)-[:PUBLISHED_IN]->(si)
MERGE (s1)-[:HARVESTED_FOR]->(p)
MERGE (s1)-[:HAS_CONTRIBUTION]->(sc1)
MERGE (s1)-[:HAS_CONTRIBUTION]->(sc2)


CREATE (s2:SourceRecord {
  harvester:            'HAL',
  url:                  'https://hal.science/hal-04234567',
  uid:                  'hal-hal-04234567',
  source_identifier:    'hal-04234567',
  hal_collection_codes: ['astronomy', 'cosmology'],
  hal_submit_type:      'file'
})
MERGE (s2)-[:HARVESTED_FOR]->(p)

CREATE (doc:Document {uid:                    'doc1',
                      document_type:          'JournalArticle',
                      publication_date:       '2012-09-19',
                      publication_date_start: '2012-09-19T00:00:00Z',
                      publication_date_end:   '2012-09-19T23:59:59Z',
                      upw_oa_status:          'gold',
                      oa_status:              'green'})
CREATE(title1:Literal {language: 'en',
                       value:    'All We Are Is Dust in the WIM: Constraints on Dust Properties in the Milky Way’s Warm Ionized Medium'})
CREATE(title2:Literal {language: 'fr',
                       value:    'Nous ne sommes que de la poussière dans le WIM : contraintes sur les propriétés de la poussière dans le milieu ionisé chaud de la Voie Lactée'})
CREATE(abstract1:TextLiteral {language: 'en',
                              value:    'A detailed abstract of the document in English.'})
CREATE(abstract2:TextLiteral {language: 'ul',
                              value:    'A detailed abstract of the document in an undetermined language.'})
CREATE (doc)-[:HAS_TITLE]->(title1)
CREATE (doc)-[:HAS_TITLE]->(title2)
CREATE (doc)-[:HAS_ABSTRACT]->(abstract1)
CREATE (doc)-[:HAS_ABSTRACT]->(abstract2)
CREATE (doc)-[:HAS_SUBJECT]->(c1)
CREATE (doc)-[:HAS_SUBJECT]->(c2)
CREATE (doc)-[:HAS_SUBJECT]->(c3)
CREATE (doc)-[:RECORDED_BY]->(s1)
CREATE (doc)-[:RECORDED_BY]->(s2)

CREATE(j:Journal {uid: 'journal-0004-637X', issn_l: '0004-637X', publisher: 'American Astronomical Society', titles: [
  'The Astrophysical Journal']})

MERGE (j)-[:HAS_IDENTIFIER]->(ji1)
MERGE (j)-[:HAS_IDENTIFIER]->(ji2)
MERGE (j)-[:HAS_IDENTIFIER]->(ji3)

CREATE (doc)-[:PUBLISHED_IN {volume: '823', issue: '1', pages: '1–20'}]->(j)

// --- Authority organizations (Root + States) ---

//Places
CREATE (place1:Place {latitude:1.2344, longitude:44.33335})
CREATE (place2:Place {latitude:12.34466, longitude:33.44335})

// Shared identifiers
CREATE (ao_ror:AgentIdentifier {type: 'ror', value: 'https://ror.org/000000000'})
CREATE (ao_idref:AgentIdentifier {type: 'idref', value: '123456789'})
CREATE (ao_hal_1:AgentIdentifier {type: 'hal', value: '2001'})
CREATE (ao_hal_2:AgentIdentifier {type: 'hal', value: '2002'})

// Root
CREATE (ao_root:AuthorityOrganization:AuthorityOrganizationRoot {
  uid:                      'ao-root-1',
  display_names:            ['Université Anonyme'],
  source_organization_uids: ['hal-2001', 'hal-2002']
})

// Two states attached to root
CREATE (ao_state_1:AuthorityOrganization:AuthorityOrganizationState {
  uid:                      'ao-state-1',
  display_names:            ['Université Anonyme'],
  source_organization_uids: ['hal-2001']
})

CREATE (ao_state_2:AuthorityOrganization:AuthorityOrganizationState {
  uid:                      'ao-state-2',
  display_names:            ['Université Anonyme'],
  source_organization_uids: ['hal-2002']
})

MERGE (ao_root)-[:HAS_POS]->(place1)
MERGE (ao_root)-[:HAS_POS]->(place2)

MERGE (ao_state_1)-[:HAS_POS]->(place1)

// Attach states to root
MERGE (ao_root)-[:HAS_STATES]->(ao_state_1)
MERGE (ao_root)-[:HAS_STATES]->(ao_state_2)

// Identifiers:
// - states each have their own hal + common idref
// - root has only the common identifier(s) you want (here: ror)
MERGE (ao_state_1)-[:HAS_IDENTIFIER]->(ao_hal_1)
MERGE (ao_state_1)-[:HAS_IDENTIFIER]->(ao_idref)

MERGE (ao_state_2)-[:HAS_IDENTIFIER]->(ao_hal_2)
MERGE (ao_state_2)-[:HAS_IDENTIFIER]->(ao_idref)

MERGE (ao_root)-[:HAS_IDENTIFIER]->(ao_ror)

// --- Contributions (Document-side) ---
CREATE (c_doc_1:Contribution {uid: 'contrib-1', roles: ['AUTHOR']})
CREATE (c_doc_2:Contribution {uid: 'contrib-2', roles: ['AUTHOR']})

// Link doc -> contributions
MERGE (doc)-[:HAS_CONTRIBUTION]->(c_doc_1)
MERGE (doc)-[:HAS_CONTRIBUTION]->(c_doc_2)

// Link person -> contributions
MERGE (p)-[:HAS_CONTRIBUTION]->(c_doc_1)
MERGE (p)-[:HAS_CONTRIBUTION]->(c_doc_2)

// Affiliations:
// - contribution 1 attached to a STATE
// - contribution 2 attached to a ROOT
MERGE (c_doc_1)-[:HAS_AFFILIATION_STATEMENT]->(ao_state_1)
MERGE (c_doc_2)-[:HAS_AFFILIATION_STATEMENT]->(ao_root)

