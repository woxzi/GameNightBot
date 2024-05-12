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
import { PollStatuses, Suggestion, Vote } from "../dbModels";

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

    let content: string = `## Current Status for Game Nights At ${interaction.guild?.name}:\n`;
    if (!!pollStatus || pollStatus === PollStatuses.Closed) {
      // - if closed, send generic message
      content = GetPollClosedMessage();
    } else if (pollStatus === PollStatuses.PrePoll) {
      // - if pre-poll, get suggestions
      var suggestions = await getSuggestionsForWeek({
        Guild: guild,
        WeekNumber: weekNumber,
      });

      content += GetPrePollMessage(suggestions);
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

function GetPollClosedMessage() {
  return (
    "## Poll Closed\n" +
    "This poll is closed. Please check back later for when the next poll opens."
  );
}

function GetFailureMessage() {
  return "Something went wrong.";
}

function GetPrePollMessage(suggestions: Suggestion[]) {
  let message =
    "### Accepting Activity Suggestions\n" + "***Current Suggestions:***\n";
  for (const suggestion of suggestions) {
    message += `- ${ToTitleCaseUpperOnly(suggestion.Name)}\n`;
  }

  return message;
}

function GetPollingMessage(activeVotes: Vote[]) {
  let message =
    "### Accepting Votes for Activities\n" + "***Current Votes:***\n";

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

function ToTitleCaseUpperOnly(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1);
  });
}
