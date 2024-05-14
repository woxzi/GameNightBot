import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  GuildMember,
  Role,
} from "discord.js";
import { Command } from "../Command";
import appsettings from "../appsettings.json";

export const Leave: Command = {
  name: "leave",
  description: "Joining allows you to receive notifications from this bot.",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    var member = (await interaction.guild?.members.cache.find(
      (x) => x.user.id === interaction.member?.user.id
    )) as GuildMember;

    const role = member.roles.cache.find(
      (x) => x.id === appsettings.appConfig.roleId
    );

    if (role) {
      await member.roles.remove(role);

      interaction.reply({
        ephemeral: true,
        content: `You have left <@&${role.id}>`,
      });
    } else {
      interaction.reply({
        ephemeral: true,
        content: `You are not in <@&${appsettings.appConfig.roleId}>!`,
      });
    }
  },
};
