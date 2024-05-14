import { Client, TextChannel } from "discord.js";
import appsettings from "../appsettings.json";
import {
  getAllActiveVotes,
  getCurrentWeekNumber,
  getSuggestionsForWeek,
  savePollStatus,
  saveSuggestion,
} from "../data";
import { PollStatuses } from "../enums";
import {
  GetCurrentVotesMessageComponent,
  PingRoleFooter,
} from "../commands/shared/messageComponents";
import { getSortedVoteTotals } from "../commands/shared/voteLogic";

export default async function (client: Client) {
  console.log("Closing Poll...");

  const guild = appsettings.appConfig.guild;
  const weekNumber = await getCurrentWeekNumber({ Guild: guild });

  const votes = await getAllActiveVotes({
    Guild: guild,
    WeekNumber: weekNumber,
  });

  // update status to closed
  savePollStatus({
    Guild: guild,
    ActiveWeek: weekNumber + 1,
    Status: PollStatuses.Closed,
  });

  // copy over top n suggestions to next week
  const suggestions = await getSuggestionsForWeek({
    Guild: guild,
    WeekNumber: weekNumber,
  });

  const topActivities = getSortedVoteTotals(votes)
    .slice(0, appsettings.pollConfig.suggestionsToKeep)
    .map((x) => x[0]);

  const topSuggestions = suggestions.filter((suggestion) =>
    topActivities.includes(suggestion.Name)
  );

  for (const suggestion of topSuggestions) {
    saveSuggestion({ ...suggestion, WeekNumber: weekNumber + 1 });
  }

  // construct and send response message
  let message = "# Game Night - Poll Closed\n";
  message +=
    "The poll is now closed. It will reopen for activity suggestions on Saturday morning.\n\n";

  message += GetCurrentVotesMessageComponent(votes, "Voting Results:");
  message += PingRoleFooter();

  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send(message);
}
