import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import { getCurrentWeekNumber, savePollStatus } from "src/data";
import { PollStatuses } from "src/enums";

export default async function (client: Client) {
  console.log("Closing Poll...");

  const guild = appsettings.appConfig.guild;
  savePollStatus({
    Guild: guild,
    ActiveWeek: await getCurrentWeekNumber({ Guild: guild }),
    Status: PollStatuses.Closed,
  });

  let message = "# Game Night";
  message +=
    "The poll is now closed. It will reopen for activity suggestions on Saturday morning.";

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
