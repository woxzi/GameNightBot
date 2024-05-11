import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  ChannelType,
} from "discord.js";
import { Command } from "../Command";
import { getGuildConfig, saveGuildConfig } from "../cache";

export const SetChannel: Command = {
  name: "set_channel",
  description: "Sets the channel that the bot reads messages from",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "channel",
      description: "The channel to read from",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    const channel = interaction.options?.get("channel")?.channel;
    let content;
    if (!channel || channel.type !== ChannelType.GuildText) {
      content = "Could not determine channel to use!";
    } else {
      const config = await getGuildConfig(interaction.guildId!);
      config.TargetChannelId = channel.id;
      saveGuildConfig(config);
      content = `Channel set to <#${channel.id}>`;
    }

    await interaction.reply({
      ephemeral: true,
      content: content,
    });
  },
};
