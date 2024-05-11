import { CommandInteraction, Client, ApplicationCommandType } from "discord.js";
import { Command } from "../Command";
import { getAllPlayerData } from "../data";

export const Leaderboard: Command = {
  name: "leaderboard",
  description: "Shows the top 10 scorers in this server",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.guildId) {
      const error = "Leaderboard must be retrieved for a server!";
      console.error(error);
      throw new Error(error);
    }

    let content = "# Top 10 Good Morning Scorers";

    const playerDataForGuild = await getAllPlayerData(interaction.guildId);
    playerDataForGuild.forEach((player, index) => {
      content += `\n${index + 1}. *${player.DisplayName}* - ${
        player.PointTotal
      } points`;
    });

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};
