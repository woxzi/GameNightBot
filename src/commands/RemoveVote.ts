import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  GuildMember,
  Role,
} from "discord.js";
import { Command } from "../Command";
import appsettings from "../appsettings.json";

export const RemoveVote: Command = {
  name: "remove_vote",
  description: "Removes a vote that has previously been added.",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {},
};
