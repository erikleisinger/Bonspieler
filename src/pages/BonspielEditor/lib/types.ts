export type StageType = 'pool' | 'bracket'

export interface BonspielStage {
  id: string;
  name: string;
  type: StageType;
}
