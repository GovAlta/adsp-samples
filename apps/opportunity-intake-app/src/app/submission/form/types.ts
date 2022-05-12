import { OpportunityData } from '../../types';

export interface SectionProps {
  showSummary?: boolean;
  value: OpportunityData;
  onUpdate: (update: OpportunityData) => void;
}
