//index.d.ts
export as namespace GenericNamespace;

export const enum PollStatuses {
  Unknown = 0, // avoid using default value for anything
  PrePoll = 1, // asking for suggestions
  Polling = 2, // asking for votes
  Closed = 3, // voting has closed, wait for next poll
}
