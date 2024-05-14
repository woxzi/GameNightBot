import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import {
  getCurrentWeekNumber,
  getSuggestionsForWeek,
  savePollStatus,
} from "../data";
import { PollStatuses } from "../enums";
import {
  GetSuggestionsMessageComponent,
  PingRoleFooter,
} from "../commands/shared/messageComponents";

export default async function (client: Client) {
  console.log("Opening Poll...");

  const guild = appsettings.appConfig.guild;
  const weekNumber = await getCurrentWeekNumber({ Guild: guild });
  savePollStatus({
    Guild: guild,
    ActiveWeek: weekNumber,
    Status: PollStatuses.Polling,
  });

  const suggestions = await getSuggestionsForWeek({
    Guild: guild,
    WeekNumber: weekNumber,
  });

  let message = "# Game Night - Poll Open\n";
  message +=
    "The poll is now accepting votes. Please cast your vote using the `/vote` command. Votes will be accepted until Thursday afternoon.\n\n";

  message += GetSuggestionsMessageComponent(suggestions, "Activities:");
  message += PingRoleFooter();

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
