export type Race = "T" | "Z" | "P";
export type Gender = "M" | "F";
export type Tier = "S" | "A" | "B" | "C";

export interface Crew {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: number;
  nickname: string;
  race: Race;
  tier: Tier | null;
  gender: Gender;
  crew_id: number | null;
  is_fa: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerWithCrew extends Player {
  crew_name: string | null;
}

export interface Tournament {
  id: number;
  name: string;
  year: number;
  winner_crew_id: number | null;
  status: string;
}

export interface TournamentWithCrew extends Tournament {
  winner_crew_name: string | null;
}

export interface TierVersion {
  id: number;
  version: string;
  released_at: string;
  notes: string | null;
}

export interface CrewDetail extends Crew {
  member_count: number;
  players: Player[];
}

export interface CrewWithCount extends Crew {
  member_count: number;
}
