import { Client, Message } from "discord.js";
import { addPlayerPoints, getDailyStatus } from "../data";
import moment from "moment-timezone";
import appsettings from "../appsettings.json";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message<boolean>) => {
    if (message.author.bot || !message.guildId) return;

    if (message.channelId === appsettings.appConfig.channel) {
      HandleMessage(message);
    }
  });
};

async function HandleMessage(message: Message<boolean>) {
  console.log("Handle message triggered");
}
