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
  getSuggestionsForWeek,
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

    let names: string[] = [];

    const status = await getPollStatus({ Guild: guild });
    if (status === PollStatuses.Closed) {
      // if closed, get the status for the previous week
      const votes = await getAllActiveVotes({
        Guild: guild,
        WeekNumber: weekNumber - 1,
      });

      names = votes.map((x) => x.DisplayName);
    } else if (status === PollStatuses.Polling) {
      // if pre-poll or poll, get the status for the current week
      const votes = await getAllActiveVotes({
        Guild: guild,
        WeekNumber: weekNumber,
      });

      names = votes.map((x) => x.DisplayName);
    } else {
      // if pre-poll or poll, get the status for the current week
      const suggestions = await getSuggestionsForWeek({
        Guild: guild,
        WeekNumber: weekNumber,
      });

      names = suggestions.map((x) => x.SuggestedByDisplayName);
    }

    var distinctNames: string[] = [];
    for (const name of names) {
      if (!distinctNames.includes(name)) {
        distinctNames.push(name);
      }
    }

    let message = "";
    if (distinctNames.length === 0) {
      message = "No users are attending yet.";
    } else {
      message = "### List of Attending Users\n";
      for (const name of distinctNames) {
        message += `- ${name}\n`;
      }
    }

    interaction.reply({ ephemeral: true, content: message });
  },
};
