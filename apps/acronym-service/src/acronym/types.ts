export interface AcronymDescription {
  acronym: string;
  definitions: {
    context: string;
    represents: string;
    description: string;
  }[];
}
