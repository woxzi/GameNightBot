import { Suggestion, Vote } from "../../dbModels";
import { VoteType } from "../../enums";
import { getSortedVoteTotals } from "./voteLogic";
import appsettings from "../../appsettings.json";

export function GetCurrentVotesMessageComponent(
  votes: Vote[],
  suggestions: Suggestion[],
  header: string = "Current Votes:"
) {
  let message = `***${header}***\n`;

  const sortedVotes = getSortedVoteTotals(votes, suggestions);

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

export function PingRoleFooter() {
  return `\n*You can unsubscribe from the <@&${appsettings.appConfig.roleId}> role and stop receiving pings by using the \`/leave\` command.*`;
}

export function GetVotesRemainingString(upvotes: number, downvotes: number) {
  return `(${upvotes}↑, ${downvotes}↓ Remaining)`;
}
