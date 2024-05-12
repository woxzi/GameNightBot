import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../Command";
import { resetDbFile } from "../data";
import appsettings from "../appsettings.json";

export const ResetDb: Command = {
  name: "reset_database",
  description: "Initializes the database file",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (client: Client, interaction: CommandInteraction) => {
    const content = "Successfully created database";
    if (interaction.user.id === appsettings.appConfig.administratorUserId) {
      resetDbFile();
      await interaction.reply({
        ephemeral: true,
        content,
      });
    } else {
      interaction.reply({
        ephemeral: true,
        content: "You do not have permission to reset the app database!",
      });
    }
  },
};
