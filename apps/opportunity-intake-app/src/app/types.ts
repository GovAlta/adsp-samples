export interface FormInfo {
  id: string;
  created: string;
  submitted: string;
  status: string;
  applicant: {
    addressAs: string;
  };
}

export interface FileInfo {
  id: string;
  urn: string;
  filename: string;
}

export interface OpportunityData {
  ministry: string;
  program: string;
  team: string;
  description: string;
  examples: {
    users: string;
    need: string;
    use: string;
  }[];
}

export interface OpportunityForm {
  id: string;
  data: OpportunityData;
  files: Record<string, string>;
}
