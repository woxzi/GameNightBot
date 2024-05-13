import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import appsettings from "./appsettings.json";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import registerCronTriggers from "./listeners/registerCronTriggers";
import { QueryClient } from "@tanstack/query-core";

export const queryClient = new QueryClient();
const config = appsettings.discordAPIConfig;

const inviteLinkBase = "https://discord.com/api/oauth2/authorize";
const inviteLink = `${inviteLinkBase}?client_id=${
  config.oauth.clientId
}&permissions=${config.permissions}&scope=${encodeURIComponent(config.scope)}`;

console.log("Bot is starting...");

const clientOptions: ClientOptions = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
};
const client = new Client(clientOptions);

// register listeners
interactionCreate(client);
registerCronTriggers(client);
ready(client, inviteLink);

client.login(config.token);

// for each server, track points for each user that has said 'good morning'
// only track first good morning each day as a 'victory'
// track additional points for the first n players that day
