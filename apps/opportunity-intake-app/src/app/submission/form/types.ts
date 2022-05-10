import { OpportunityData } from '../../intake.slice';

export interface SectionProps {
  showSummary?: boolean;
  value: OpportunityData;
  onUpdate: (update: OpportunityData) => void;
}
