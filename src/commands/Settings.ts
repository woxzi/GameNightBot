import { CommandInteraction, Client, ApplicationCommandType } from "discord.js";
import { Command } from "../Command";
import { getGuildConfig } from "../cache";

export const Settings: Command = {
  name: "settings",
  description: "Displays the settings currently being used by the bot",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const config = await getGuildConfig(interaction.guildId!);
    const channelString = config.TargetChannelId
      ? `<#${config.TargetChannelId}>`
      : "Channel not set.";
    const content = `- Guild Id: ${config.Guild}\n- Channel: ${channelString}\n- Timezone: ${config.Timezone}`;

    await interaction.reply({
      ephemeral: true,
      content,
    });
  },
};
