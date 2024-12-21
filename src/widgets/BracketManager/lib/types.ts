export interface BracketGameConnections {
  winner: string | null;
  loser: string | null;
}

export interface BracketGame {
  id: string;
  roundNumber: number;
  connections: BracketGameConnections;
}

export interface BracketGameWithOrigins extends BracketGame {
  origins: {
    winner: BracketGame[];
    loser: BracketGame[];
  }
}

export interface BracketEvent {
  [key: string]: BracketGame[];
}
