import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import { getPlayerStats } from "../data";

export const Stats: Command = {
  name: "stats",
  description: "Checks your stats",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "The user to get stats for",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.guildId) {
      const message = "Good morning must be said on a server!";
      console.error(message);
      throw new Error(message);
    }

    var stats = await getPlayerStats({
      Guild: interaction.guildId,
      UserId:
        interaction.options?.getUser("user", false)?.id ?? interaction.user.id,
    });

    let content: string;
    if (!!stats) {
      content = `
      ## Good Morning Stats for <@${stats.UserId}>:
      - Points: ${stats.PointTotal}
      - Wins: ${stats.WinTotal}
      `;
    } else {
      content =
        "Could not find user data! This can happen if a user has no points.";
    }

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};
