import { Client } from "discord.js";
import { Commands } from "../Commands";

export default (client: Client, inviteLink: string): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }

    await client.application.commands.set(Commands);

    console.log(`${client.user.username} is online`);
    console.log(`Invite the bot using the below link: ${inviteLink}`);
  });
};
