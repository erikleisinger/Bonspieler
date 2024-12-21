export interface PoolTeam {
  id: string;
  name: string;
}
export interface Pool {
  id: string;
  name: string;
  teams: PoolTeam[]
}
