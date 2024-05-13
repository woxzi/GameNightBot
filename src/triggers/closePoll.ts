import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import {
  getAllActiveVotes,
  getCurrentWeekNumber,
  savePollStatus,
} from "../data";
import { PollStatuses } from "../enums";
import { GetCurrentVotesMessageComponent } from "../commands/shared/messageComponents";

export default async function (client: Client) {
  console.log("Closing Poll...");

  const guild = appsettings.appConfig.guild;
  const weekNumber = await getCurrentWeekNumber({ Guild: guild });

  const votes = await getAllActiveVotes({
    Guild: guild,
    WeekNumber: weekNumber,
  });

  savePollStatus({
    Guild: guild,
    ActiveWeek: weekNumber + 1,
    Status: PollStatuses.Closed,
  });

  let message = "# Game Night\n";
  message +=
    "The poll is now closed. It will reopen for activity suggestions on Saturday morning.\n\n";

  message += GetCurrentVotesMessageComponent(votes, "Voting Results:");

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
