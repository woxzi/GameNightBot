import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import {
  getCurrentWeekNumber,
  getPollStatus,
  getSuggestionsForWeek,
  saveSuggestion,
} from "../data";
import { PollStatuses } from "../enums";
import appsettings from "../appsettings.json";

export const Suggest: Command = {
  name: "suggest",
  description: "Suggest an activity for game night",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "name",
      description: "The name of the activity",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    const suggestionName: string = ToTitleCaseUpperOnly(
      interaction.options?.get("name", true).value as string
    );

    const weekNumber = await getCurrentWeekNumber({
      Guild: interaction.guildId as string,
    });

    const [validated, validationMessage] = await ValidatePollStatus(
      interaction,
      suggestionName,
      weekNumber
    );
    if (!validated) {
      interaction.reply({
        ephemeral: true,
        content: validationMessage,
      });
      return;
    }

    await saveSuggestion({
      Guild: interaction.guildId as string,
      Name: suggestionName as string,
      SuggestedByDisplayName: interaction.user.displayName,
      SuggestedByUserId: interaction.user.id,
      WeekNumber: weekNumber,
    });

    interaction.reply({
      ephemeral: true,
      content:
        "Your suggestion has been added. Use `/poll` to view the current list of suggestions.",
    });
  },
};

async function ValidatePollStatus(
  interaction: CommandInteraction,
  suggestion: string,
  weekNumber: number
): Promise<[boolean, string?]> {
  const statusValue = await getPollStatus({
    Guild: interaction.guildId as string,
  });
  if (statusValue !== PollStatuses.PrePoll) {
    return [
      false,
      "The poll is not accepting suggestions right now. Please check back later.",
    ];
  }

  const suggestions = await getSuggestionsForWeek({
    Guild: interaction.guildId as string,
    WeekNumber: weekNumber,
  });

  if (suggestions.length >= appsettings.pollConfig.maxSuggestions) {
    return [
      false,
      `There is no more space for suggestions in this poll! Please try again next week.`,
    ];
  }

  if (suggestions.map((x) => x.Name).includes(suggestion)) {
    return [
      false,
      `*${ToTitleCaseUpperOnly(
        suggestion
      )}* has already been submitted for this week! You can view the current list of suggestions using the \`/poll\` command.`,
    ];
  }

  return [true];
}

function ToTitleCaseUpperOnly(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1);
  });
}
