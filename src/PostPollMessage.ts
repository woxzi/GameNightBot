import { Client, TextChannel } from "discord.js";
import appsettings from "./appsettings.json";

export default (client: Client) => {
  const channel = client.channels.cache.get(appsettings.appConfig.channel);
  (channel as TextChannel).send("Test message");
};
