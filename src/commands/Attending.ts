import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  GuildMember,
  Role,
} from "discord.js";
import { Command } from "../Command";
import appsettings from "../appsettings.json";
import {
  getAllActiveVotes,
  getCurrentWeekNumber,
  getPollStatus,
} from "../data";
import { PollStatuses } from "src/enums";
import { Vote } from "../dbModels";

export const Attending: Command = {
  name: "attending",
  description: "Lists all users attending game night.",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const guild = interaction.guildId as string;
    const weekNumber = await getCurrentWeekNumber({
      Guild: guild,
    });

    let votes: Vote[] = [];

    const status = await getPollStatus({ Guild: guild });
    if (status === PollStatuses.Closed) {
      // if closed, get the status for the previous week
      votes = await getAllActiveVotes({
        Guild: guild,
        WeekNumber: weekNumber - 1,
      });
    } else {
      // if pre-poll or poll, get the status for the current week
      votes = await getAllActiveVotes({
        Guild: guild,
        WeekNumber: weekNumber,
      });
    }

    var voterNames: string[] = [];
    for (const vote of votes) {
      if (!voterNames.includes(vote.DisplayName)) {
        voterNames.push(vote.DisplayName);
      }
    }

    let message = "### List of Attending Users\n";
    for (const name of voterNames) {
      message += `- ${name}\n`;
    }

    interaction.reply({ ephemeral: true, content: message });
  },
};
