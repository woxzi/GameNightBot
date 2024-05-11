import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import Config from "./appsettings.json";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import messageCreate from "./listeners/messageCreate";
import { QueryClient } from "@tanstack/query-core";

export const queryClient = new QueryClient();

const inviteLinkBase = "https://discord.com/api/oauth2/authorize";
const inviteLink = `${inviteLinkBase}?client_id=${
  Config.oauth.clientId
}&permissions=${Config.permissions}&scope=${encodeURIComponent(Config.scope)}`;

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
messageCreate(client);
ready(client, inviteLink);

client.login(Config.token);

// for each server, track points for each user that has said 'good morning'
// only track first good morning each day as a 'victory'
// track additional points for the first n players that day
