import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  GuildMember,
  Role,
} from "discord.js";
import { Command } from "../Command";
import appsettings from "../appsettings.json";

export const Attending: Command = {
  name: "attending",
  description: "Lists all users attending game night.",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {},
};
