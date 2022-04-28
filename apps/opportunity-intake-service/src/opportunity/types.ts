export interface OpportunityFormData {
  data: {
    ministry: string;
    service: string;
    description: string;
    useCases: string[];
  };
  files: Record<string, string>;
}

export interface FormInfo {
  id: string;
  status: 'draft' | 'submitted';
  created: Date;
}
