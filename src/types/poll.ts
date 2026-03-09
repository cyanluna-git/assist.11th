export interface PollSummary {
  id: string;
  title: string;
  description: string | null;
  isMultiple: boolean;
  isAnonymous: boolean;
  closesAt: string | null;
  createdAt: string;
  creatorId: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  totalVotes: number;
  optionCount: number;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface PollDetail {
  id: string;
  title: string;
  description: string | null;
  isMultiple: boolean;
  isAnonymous: boolean;
  closesAt: string | null;
  createdAt: string;
  creatorId: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  options: PollOption[];
  totalVoters: number;
  userVotedOptionIds: string[];
}

export interface PollResultOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  voters?: { id: string; name: string }[];
}

export interface PollResults {
  id: string;
  title: string;
  isAnonymous: boolean;
  isMultiple: boolean;
  closesAt: string | null;
  totalVoters: number;
  totalVoteCount: number;
  options: PollResultOption[];
}
