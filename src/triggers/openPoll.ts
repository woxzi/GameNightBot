import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import { getCurrentWeekNumber, savePollStatus } from "../data";
import { PollStatuses } from "../enums";

export default async function (client: Client) {
  console.log("Opening Poll...");

  const guild = appsettings.appConfig.guild;
  savePollStatus({
    Guild: guild,
    ActiveWeek: await getCurrentWeekNumber({ Guild: guild }),
    Status: PollStatuses.Polling,
  });

  let message = "# Game Night\n";
  message +=
    "The poll is now accepting votes. Please cast your vote using the `/vote` command. Votes will be accepted until Thursday afternoon.";

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
