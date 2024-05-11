import { Client, Message } from "discord.js";
import { getGuildConfig } from "../cache";
import { addPlayerPoints, getDailyStatus } from "../data";
import { getScore } from "../scoring";
import moment from "moment-timezone";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message<boolean>) => {
    if (message.author.bot || !message.guildId) return;

    const config = await getGuildConfig(message.guildId);

    if (
      !!config.TargetChannelId &&
      message.channelId === config.TargetChannelId
    ) {
      HandleMessage(message, config);
    }
  });
};

function addHoursToEpoch(date: Date, hours: number): Date {
  const millisecondsPerHour = 60 * 60 * 1000;
  return new Date(date.valueOf() + hours * millisecondsPerHour);
}

async function HandleMessage(
  message: Message<boolean>,
  config: GuildConfiguration
) {
  const messageDate = moment
    .utc(addHoursToEpoch(message.createdAt, -2))
    .utcOffset(moment.tz(config.Timezone).utcOffset())
    .startOf("day")
    .valueOf();
  const statuses = await getDailyStatus({
    Date: messageDate,
    Guild: message.guildId!,
  });

  if (message.content.trim() === "GOOD MORNING") {
    let content;
    console.log(statuses);
    console.log(message.author.id);
    if (statuses.find((x) => x.UserId === message.author.id)) {
      content = "You cannot say **GOOD MORNING** more than once per day!";
    } else {
      let highestNumber = 0;
      for (const status of statuses) {
        if (highestNumber < status.Place) {
          highestNumber = status.Place;
        }
      }

      const place = highestNumber + 1;
      const score = getScore(place);

      addPlayerPoints({
        Guild: config.Guild,
        Date: messageDate,
        UserId: message.author.id,
        DisplayName: message.member?.nickname ?? message.author.displayName,
        Place: place,
        Winner: place === 1,
        Points: score,
      });

      content = `You are ${formatWithSuffix(
        highestNumber + 1
      )} to say **GOOD MORNING** today! You have received ${score} points!`;
    }

    message.reply({
      content,
    });
  }
}

function formatWithSuffix(num: number) {
  return `${num}${getNumericalSuffix(num)}`;
}

function getNumericalSuffix(num: number): string {
  switch (num % 100) {
    case 11:
    case 12:
    case 13:
      return "th";
  }
  switch (num % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
