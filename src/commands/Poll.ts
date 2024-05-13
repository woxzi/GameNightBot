import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import {
  getAllActiveVotes,
  getCurrentWeekNumber,
  getPollStatus,
  getSuggestionsForWeek,
} from "../data";
import { Suggestion, Vote } from "../dbModels";
import { PollStatuses } from "../enums";
import {
  GetCurrentVotesMessageComponent,
  GetSuggestionsMessageComponent,
} from "./shared/messageComponents";

export const Poll: Command = {
  name: "poll",
  description: "Displays the current poll status",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const guild = interaction.guildId as string;
    const weekNumber = await getCurrentWeekNumber({ Guild: guild });

    // get state
    const pollStatus = await getPollStatus({
      Guild: guild,
    });

    let content: string = ""; //`## Current Status for Game Nights At ${interaction.guild?.name}:\n`;
    if (pollStatus === PollStatuses.PrePoll) {
      // - if pre-poll, get suggestions
      var suggestions = await getSuggestionsForWeek({
        Guild: guild,
        WeekNumber: weekNumber,
      });

      content += GetPrePollMessage(suggestions);
    } else if (pollStatus === PollStatuses.Closed) {
      // - if closed, get votes
      var activeVotes = await getAllActiveVotes({
        Guild: guild,
        WeekNumber: weekNumber,
      });

      content = GetPollClosedMessage(activeVotes);
    } else if (pollStatus === PollStatuses.Polling) {
      // - if poll, get votes
      var activeVotes = await getAllActiveVotes({
        Guild: guild,
        WeekNumber: weekNumber,
      });

      content += GetPollingMessage(activeVotes);
    } else {
      content = GetFailureMessage();
    }

    await interaction.reply({
      ephemeral: true,
      content: content.trim(),
    });
  },
};

function GetPollClosedMessage(activeVotes: Vote[]) {
  let message = "### Poll Closed\n";
  if (activeVotes.length > 0) {
    message += "***Previous Poll Results:***\n";
  } else {
    message +=
      "No votes have been cast for this poll yet. Add yours using `/vote`!\n";
  }

  const voteTotals: { [Key: string]: number } = {};
  for (const vote of activeVotes) {
    if (vote.VotedFor in activeVotes) {
      voteTotals[vote.VotedFor] += vote.VoteCount;
    } else {
      voteTotals[vote.VotedFor] = vote.VoteCount;
    }
  }

  let maxDigits = 0;
  for (var suggestionName in voteTotals) {
    const length = voteTotals[suggestionName].toString().length;
    if (length > maxDigits) {
      maxDigits = length;
    }
  }

  for (var suggestionName in voteTotals) {
    const total = voteTotals[suggestionName];
    const totalString = String(total).padStart(maxDigits, " ");
    message += `- **[${totalString}]** - ${suggestionName}\n`;
  }

  return message;
}

function GetFailureMessage() {
  return "Something went wrong.";
}

function GetPrePollMessage(suggestions: Suggestion[]) {
  let message = "### Accepting Activity Suggestions\n";

  if (suggestions.length === 0) {
    return (
      message + "No suggestions have been made yet. Use `/suggest` to add one!`"
    );
  } else {
    return message + GetSuggestionsMessageComponent(suggestions);
  }
}

function GetPollingMessage(activeVotes: Vote[]) {
  let message = "### Accepting Votes for Activities\n";
  if (activeVotes.length <= 0) {
    return (
      message +
      "No votes have been cast for this poll yet. Add yours using `/vote`!\n"
    );
  } else {
    return message + GetCurrentVotesMessageComponent(activeVotes);
  }
}
