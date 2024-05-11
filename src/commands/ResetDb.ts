import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../Command";
import { resetDbFile } from "../data";

export const ResetDb: Command = {
  name: "reset_database",
  description: "Initializes the database file",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (client: Client, interaction: CommandInteraction) => {
    const content = "Successfully created database";
    resetDbFile();
    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};
