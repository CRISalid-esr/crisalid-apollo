export const typeDefs = `#graphql

type AgentIdentifier @node {
    type: String!
    value: String!
}
type Organisation @node {
    uid: ID!
    acronym: String
    signature: String
    names: [Literal!]! @relationship(type: "HAS_NAME", direction: OUT)
    identifiers: [AgentIdentifier!]! @relationship(type: "HAS_IDENTIFIER", direction: OUT)
    types: [String!]! @cypher(statement: """
    RETURN labels(this) AS types
    """,
        columnName: "types")
}
type PersonName @node {
    first_names: [Literal!]! @relationship(type: "HAS_FIRST_NAME", direction: OUT)
    last_names: [Literal!]! @relationship(type: "HAS_LAST_NAME", direction: OUT)
}
type Person @node {
    uid: ID!
    display_name: String
    names: [PersonName!]! @relationship(type: "HAS_NAME", direction: OUT)
    identifiers: [AgentIdentifier!]! @relationship(type: "HAS_IDENTIFIER", direction: OUT)
    memberships: [Organisation!]! @relationship(type: "MEMBER_OF", direction: OUT, properties: "Membership")
    employments: [Organisation!]! @relationship(type: "EMPLOYED_AT", direction: OUT, properties: "Employment")
    external: Boolean
}
type Employment @relationshipProperties {
    start_date: DateTime
    end_date: DateTime
    position_code: String
}
type Membership @relationshipProperties {
    start_date: DateTime
    end_date: DateTime
    position_code: String
}
type AuthorityOrganization @node {
    uid: ID!
    display_names: [String!]!

    # Computed union of direct identifiers + state identifiers, deduped (type,value)
    identifiers: [AgentIdentifier!]!
    @cypher(
        statement: """
        // direct ids
        OPTIONAL MATCH (this)-[:HAS_IDENTIFIER]->(root_ids:AgentIdentifier)

        // ids via states
        OPTIONAL MATCH (this)-[:HAS_STATES]->(:AuthorityOrganizationState)-[:HAS_IDENTIFIER]->(state_ids:AgentIdentifier)

        WITH collect(root_ids) + collect(state_ids) AS ids
        UNWIND ids AS id
        WITH DISTINCT id
        WHERE id IS NOT NULL

        RETURN id
        """
        columnName: "id"
    )
}
type Contribution @node {
    uid: ID!
    roles: [String!]!
    contributor: [Person!]! @relationship(type: "HAS_CONTRIBUTION", direction: IN)
    affiliations: [AuthorityOrganization!]! @relationship(type: "HAS_AFFILIATION_STATEMENT", direction: OUT)
}
type Literal @node {
    language: String!
    value: String!
}
type TextLiteral @node {
    language: String!
    value: String!
    key: String!
}
type Concept @node {
    uid: ID!
    uri: String
    pref_labels: [Literal!]! @relationship(type: "HAS_PREF_LABEL", direction: OUT)
    alt_labels: [Literal!]! @relationship(type: "HAS_ALT_LABEL", direction: OUT)
}

enum UPWOAStatus {
    green
    hybrid
    diamond
    closed
    bronze
    gold
}
enum OAStatus {
    green
    closed
}

type Document @node {
    uid: ID!
    document_type: String
    publication_date: String
    publication_date_start: DateTime
    publication_date_end: DateTime
    titles: [Literal!]! @relationship(type: "HAS_TITLE", direction: OUT)
    abstracts: [TextLiteral!]! @relationship(type: "HAS_ABSTRACT", direction: OUT)
    recorded_by: [SourceRecord!]! @relationship(type: "RECORDED_BY", direction: OUT)
    has_contributions: [Contribution!]! @relationship(type: "HAS_CONTRIBUTION", direction: OUT)
    has_subjects: [Concept!]! @relationship(type: "HAS_SUBJECT", direction: OUT)
    publishedIn: [Journal!]! @relationship(type: "PUBLISHED_IN", direction: OUT, properties: "PublishedIn")
    upw_oa_status: UPWOAStatus
    oa_status: OAStatus
}
enum HalSubmitType {
    file
    notice
    annex
}

type SourcePerson @node {
    uid: ID!
    name: String!
    source: String!
    source_identifier: String
}

type SourceContribution @node {
    role: String!
    contributor: SourcePerson! @relationship(type: "CONTRIBUTOR", direction: OUT)
}

type SourceJournal @node {
    uid: ID!
    source : String!
    source_identifier: String!
    titles: [String]
    publisher: String
    identifiers: [JournalIdentifier!]! @relationship(type: "HAS_IDENTIFIER", direction: OUT)
}

type SourceIssue @node {
    issued_by: SourceJournal @relationship(type: "ISSUED_BY", direction: OUT)
    source: String!
    source_identifier: String!
}

type PublicationIdentifier @node {
    type: String!
    value: String
}

type SourceRecord @node {
    uid: ID!
    harvester: String!
    url: String
    issued:DateTime
    source_identifier: String!
    published_in: SourceIssue @relationship(type: "PUBLISHED_IN", direction: OUT)
    document_types: [String]
    titles: [Literal!]! @relationship(type: "HAS_TITLE", direction: OUT)
    harvested_for: [Person!]! @relationship(type: "HARVESTED_FOR", direction: OUT)
    has_contributions: [SourceContribution!]! @relationship(type: "HAS_CONTRIBUTION", direction: OUT)
    has_identifiers: [PublicationIdentifier!]! @relationship(type: "HAS_IDENTIFIER", direction: OUT)
    hal_collection_codes: [String!]
    hal_submit_type: HalSubmitType
}
type PublishedIn @relationshipProperties {
    volume: String
    issue: String
    pages: String
}
type JournalIdentifier @node {
    type: String!
    value: String!
    format: String
}
type Journal @node {
    types: [String!]! @cypher(statement: """
    RETURN labels(this) AS types
    """,
        columnName: "types")
    uid: ID!
    issn_l: String
    publisher: String
    titles: [String!] # Or [Literal!]! if you model it that way
    identifiers: [JournalIdentifier!]! @relationship(type: "HAS_IDENTIFIER", direction: OUT)
    published_documents: [Document!]! @relationship(type: "PUBLISHED_IN", direction: IN, properties: "PublishedIn")
}

`;
