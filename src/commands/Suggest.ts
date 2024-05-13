import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import { getCurrentWeekNumber, getPollStatus, saveSuggestion } from "../data";
import { PollStatuses } from "src/enums";

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
    const validated = await ValidatePollStatus(interaction);
    if (!validated) {
      interaction.reply({
        ephemeral: true,
        content:
          "The poll is not accepting suggestions right now. Please check back later.",
      });
      return;
    }

    const suggestionName: string = ToTitleCaseUpperOnly(
      interaction.options?.get("name", true).value as string
    );

    await saveSuggestion({
      Guild: interaction.guildId as string,
      Name: suggestionName as string,
      SuggestedByDisplayName: interaction.user.displayName,
      SuggestedByUserId: interaction.user.id,
      WeekNumber: await getCurrentWeekNumber({
        Guild: interaction.guildId as string,
      }),
    });

    interaction.reply({
      ephemeral: true,
      content:
        "Your suggestion has been added. Use `/poll` to view the current list of suggestions.",
    });
  },
};

async function ValidatePollStatus(
  interaction: CommandInteraction
): Promise<boolean> {
  const statusValue = await getPollStatus({
    Guild: interaction.guildId as string,
  });
  return statusValue === PollStatuses.PrePoll;
}

function ToTitleCaseUpperOnly(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1);
  });
}
