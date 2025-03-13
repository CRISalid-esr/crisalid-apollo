export const typeDefs = `#graphql

type AgentIdentifier @node {
    type: String!
    value: String!
}
type Organisation @node {
    uid: ID!
    acronym: String
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

type Contribution @node {
    uid: ID!
    roles: [String!]!
    contributor: [Person!]! @relationship(type: "HAS_CONTRIBUTION", direction: IN)
}
type Literal @node {
    language: String
    value: String!
}
type Concept @node {
    uid: ID!
    uri: String
    pref_labels: [Literal!]! @relationship(type: "HAS_PREF_LABEL", direction: OUT)
    alt_labels: [Literal!]! @relationship(type: "HAS_ALT_LABEL", direction: OUT)
}
type Document @node {
    uid: ID!
    document_type: String
    publication_date: String
    publication_date_start: DateTime
    publication_date_end: DateTime
    titles: [Literal!]! @relationship(type: "HAS_TITLE", direction: OUT)
    abstracts: [Literal!]! @relationship(type: "HAS_ABSTRACT", direction: OUT)
    recorded_by: [SourceRecord!]! @relationship(type: "RECORDED_BY", direction: OUT)
    has_contributions: [Contribution!]! @relationship(type: "HAS_CONTRIBUTION", direction: OUT)
    has_subjects: [Concept!]! @relationship(type: "HAS_SUBJECT", direction: OUT)
}
type SourceRecord @node {
    uid: ID!
    harvester: String!
    url: String
    titles: [Literal!]! @relationship(type: "HAS_TITLE", direction: OUT)
    harvested_for: [Person!]! @relationship(type: "HARVESTED_FOR", direction: OUT)
}

`;
