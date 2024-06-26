import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  GuildMember,
  Role,
} from "discord.js";
import { Command } from "../Command";
import appsettings from "../appsettings.json";

export const Join: Command = {
  name: "join",
  description: "Joining allows you to receive notifications from this bot.",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    var member = (await interaction.guild?.members.cache.find(
      (x) => x.user.id === interaction.member?.user.id
    )) as GuildMember;

    var role = (await interaction.guild?.roles.cache.find(
      (x) => x.id === appsettings.appConfig.roleId
    )) as Role;

    if (member.roles.cache.find((x) => x.id === role.id)) {
      interaction.reply({
        ephemeral: true,
        content: `You are already in <@&${role.id}>!`,
      });
    } else {
      await member.roles.add(role);

      interaction.reply({
        ephemeral: true,
        content: `You have joined <@&${role.id}>`,
      });
    }
  },
};
