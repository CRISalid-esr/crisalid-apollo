export const typeDefs = `#graphql
    type Person @node {
        uid: ID!
    }
    type Literal @node {
        language: String
        value: String!
    }
    type TextualDocument @node {
        uid: ID!
        titles: [Literal!]! @relationship(type: "HAS_TITLE", direction: OUT)
        recorded_by: [SourceRecord!]! @relationship(type: "RECORDED_BY", direction: OUT)
    }
    type SourceRecord @node {
        uid: ID!
        harvester: String!
        titles: [Literal!]! @relationship(type: "HAS_TITLE", direction: OUT)
        harvested_for: [Person!]! @relationship(type: "HARVESTED_FOR", direction: OUT)
    }
`;
