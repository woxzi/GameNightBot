import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";

import VoteLogic from "./shared/voteLogic";
import { VoteType } from "../enums";

export const Upvote: Command = {
  name: "upvote",
  description: "Vote for a game you want to play this week",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "num_votes",
      description: "The number of votes to apply",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    const numVotes = interaction.options?.get("num_votes", false)
      ?.value as number;
    await VoteLogic({
      client,
      interaction,
      numVotes,
      voteType: VoteType.Upvote,
    });
  },
};
