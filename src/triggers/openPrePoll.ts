import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import { getCurrentWeekNumber, savePollStatus } from "../data";
import { PollStatuses } from "../enums";
import { PingRoleFooter } from "../commands/shared/messageComponents";

export default async function (client: Client) {
  console.log("Opening Pre-Poll...");

  const guild = appsettings.appConfig.guild;
  savePollStatus({
    Guild: guild,
    ActiveWeek: await getCurrentWeekNumber({ Guild: guild }),
    Status: PollStatuses.PrePoll,
  });

  let message = "# Game Night - Suggestions Open\n";
  message +=
    "The poll is now accepting activity suggestions. Please suggest activites for Friday night using the `/suggest` command. Suggestions will be accepted until Wednesday morning.\n\n";

  message += PingRoleFooter();

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
