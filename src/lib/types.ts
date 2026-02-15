export type Race = "T" | "Z" | "P";
export type Gender = "M" | "F";
export type Tier =
  | "God" | "King" | "Jack" | "Joker" | "Spade"
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
  | "Baby";

export type Tag = "승급임박" | "상승" | "new" | "inactive";

export const TIER_ORDER: Tier[] = [
  "God", "King", "Jack", "Joker", "Spade",
  "0", "1", "2", "3", "4", "5", "6", "7", "8",
  "Baby",
];

export const MALE_TIERS: Tier[] = ["God", "King", "Jack", "Joker", "Spade"];
export const FEMALE_TIERS: Tier[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "Baby"];

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  God: "메이저 프로리그, K리그 최상위",
  King: "K리그, H리그 중상위, ASL 24강급",
  Jack: "K리그, H리그 중하위, 아마고수 중상위",
  Joker: "조커리그, 젓갈리그, 아마고수 중하위",
  Spade: "스페이드 리그 중상위, 아재리그",
  "0": "퀸메프, 스페이드 리그 중하위",
  "1": "중메프 중상위권",
  "2": "중메프 중하위권, 퀸티어",
  "3": "안진마리그, LASL 본선급",
  "4": "사막리그",
  "5": "소나무리그",
  "6": "6부리그",
  "7": "햄스터리그",
  "8": "스타크루 유스 유입",
  Baby: "스타크래프트 입문단계",
};

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
  tag: Tag | null;
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
