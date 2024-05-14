import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  GuildMember,
  Role,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} from "discord.js";
import { Command } from "../Command";
import appsettings from "../appsettings.json";
import { PollStatuses } from "../enums";
import {
  deleteVotesForGame,
  getActiveVotesForUser,
  getCurrentWeekNumber,
  getPollStatus,
} from "../data";

const removeVoteDropdownId = "remove_vote.dropdown";

export const RemoveVote: Command = {
  name: "remove_vote",
  description: "Removes a vote that has previously been added.",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const guild = interaction.guildId as string;

    const status = await getPollStatus({ Guild: guild });
    if (status !== PollStatuses.Polling) {
      interaction.reply({
        ephemeral: true,
        content:
          "The poll is not allowing changes to votes right now! Please try again when the poll is open.",
      });
      return;
    }

    const weekNumber = await getCurrentWeekNumber({ Guild: guild });

    const votes = await getActiveVotesForUser({
      Guild: guild,
      WeekNumber: weekNumber,
      UserId: interaction.user.id,
    });

    if (votes.length <= 0) {
      interaction.reply({
        ephemeral: true,
        content: "You have not voted for anything yet!",
        components: [],
      });
      return;
    }

    const dropdown = new StringSelectMenuBuilder()
      .setCustomId(removeVoteDropdownId)
      .setPlaceholder("Select an activity to remove the votes for...");

    dropdown.addOptions(
      votes.map((vote) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(vote.VotedFor)
          .setValue(vote.VotedFor)
      )
    );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      dropdown
    );

    const response = await interaction.reply({
      ephemeral: true,
      components: [row],
    });

    const dropdownCollector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
    });

    dropdownCollector.on("collect", (i) => {
      if (
        i.user.id == response.interaction.user.id &&
        i.channelId == response.interaction.channelId &&
        i.customId === removeVoteDropdownId
      ) {
        console.log(
          `${i.user.displayName ?? i.user.globalName} removed votes for ${
            i.values[0]
          }.`
        );
        deleteVotesForGame({
          Guild: guild,
          UserId: interaction.user.id,
          VotedFor: i.values[0],
          WeekNumber: weekNumber,
        });

        i.update({
          content: "Your vote has been removed.",
          components: [],
        });
      }
    });
  },
};
