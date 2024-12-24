export interface BracketGameConnections {
  winner: string | null; // gameId that the winner of the game goes to
  loser: string | null; // gameId that the loser of the game goes to
}

export interface BracketGame {
  id: string;
  roundNumber: number; // roundNumber -- connections must reference game with roundnumber > this one
  connections: BracketGameConnections;
  transform: {
    x: number,
    y: number, // y position translation
  }
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
