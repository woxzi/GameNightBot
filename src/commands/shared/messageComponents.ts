import { Suggestion, Vote } from "../../dbModels";
import { VoteType } from "../../enums";
import { getSortedVoteTotals } from "./voteLogic";

export function GetCurrentVotesMessageComponent(
  votes: Vote[],
  header: string = "Current Votes:"
) {
  let message = `***${header}***\n`;

  const sortedVotes = getSortedVoteTotals(votes);

  let maxDigits = 0; // number of digits the largest number holds
  for (var [suggestionName, value] of sortedVotes) {
    const length = value.toString().length;
    if (length > maxDigits) {
      maxDigits = length;
    }
  }

  for (var [suggestionName, value] of sortedVotes) {
    const valueString = String(value).padStart(maxDigits, " ");
    message += `- **[${valueString}]** - *${suggestionName}*\n`;
  }

  return message;
}

export function GetSuggestionsMessageComponent(
  suggestions: Suggestion[],
  header: string = "Current Suggestions:"
) {
  let message = `***${header}***\n`;
  for (const suggestion of suggestions) {
    message += `- ${suggestion.Name}\n`;
  }

  return message;
}
