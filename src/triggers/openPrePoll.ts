import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import { getCurrentWeekNumber, savePollStatus } from "src/data";
import { PollStatuses } from "src/enums";

export default async function (client: Client) {
  console.log("Opening Pre-Poll...");

  const guild = appsettings.appConfig.guild;
  savePollStatus({
    Guild: guild,
    ActiveWeek: await getCurrentWeekNumber({ Guild: guild }),
    Status: PollStatuses.PrePoll,
  });

  let message = "# Game Night";
  message +=
    "The poll is now accepting activity suggestions. Please suggest activites for Friday night using the `/vote` command. Votes will be accepted until Wednesday morning.";

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
