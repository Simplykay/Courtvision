
export interface TeamStats {
  name: string;
  lastFive: string;
  ppg: number;
  oppPPG: number;
  keyPlayer: string;
  availability: string;
}

export interface GameInput {
  league: string;
  teamA: TeamStats;
  teamB: TeamStats;
  context: string;
}

export interface GameEvent {
  id: string;
  time: string;
  description: string;
  type: 'score' | 'foul' | 'timeout' | 'period';
}

export interface PredictionResult {
  matchup: string;
  league: string;
  round?: string;
  winner: string;
  confidence: number;
  statisticalEdge: string;
  predictedScore: {
    teamA: number;
    teamB: number;
  };
  quarterScores?: {
    teamA: number[];
    teamB: number[];
  };
  officials?: string[];
  venue?: string;
  attendance?: string;
  totalPoints: number;
  overUnder: string;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  id: string;
  timestamp: number;
  teamAAvailability: string;
  teamBAvailability: string;
  // Live Feed Fields
  isLive?: boolean;
  currentClock?: string;
  currentPeriod?: number;
  liveEvents?: GameEvent[];
}
