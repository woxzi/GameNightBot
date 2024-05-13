import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import { getCurrentWeekNumber, savePollStatus } from "../data";
import { PollStatuses } from "../enums";

export default async function (client: Client) {
  console.log("Closing Poll...");

  const guild = appsettings.appConfig.guild;
  savePollStatus({
    Guild: guild,
    ActiveWeek: (await getCurrentWeekNumber({ Guild: guild })) + 1,
    Status: PollStatuses.Closed,
  });

  let message = "# Game Night\n";
  message +=
    "The poll is now closed. It will reopen for activity suggestions on Saturday morning.";

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
