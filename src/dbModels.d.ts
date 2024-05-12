export interface Vote {
  Guild: string;
  UserId: string;
  DisplayName: string;
  VotedFor: string;
  VoteCount: number;
  WeekNumber: number;
}

export interface Suggestion {
  Guild: string;
  SuggestedByUserId: string;
  SuggestedByDisplayName: string;
  Name: string;
  WeekNumber: number;
}

export enum PollStatuses {
  Unknown = 0, // avoid using default value for anything
  PrePoll = 1, // asking for suggestions
  Polling = 2, // asking for votes
  Closed = 3, // voting has closed, wait for next poll
}

export interface GetCurrentWeekNumber {
  Guild: string;
}

export interface PollStatus {
  Guild: string;
  Status: PollStatuses;
}

export type GetPollStatus = Omit<PollStatus, "Status">;

export type GetSuggestionsForWeek = Omit<
  Suggestion,
  "SuggestedByUserId" | "SuggestedByDisplayName" | "Name"
>;

export type GetAllActiveVotes = Omit<
  GetActiveUserVotesForGame,
  "VotedFor" | "UserId"
>;
export type GetActiveVotesForUser = Omit<GetActiveUserVotesForGame, "VotedFor">;

export type GetActiveVotesForUserIgnoringSpecificGame =
  GetActiveUserVotesForGame;

export type DeleteVotesForGame = GetActiveUserVotesForGame;

export type GetActiveUserVotesForGame = Omit<
  Vote,
  "DisplayName" | "PointTotal" | "VoteCount"
>;
