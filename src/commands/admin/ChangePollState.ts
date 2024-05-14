import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} from "discord.js";
import { Command } from "../../Command";
import { resetDbFile } from "../../data";
import appsettings from "../../appsettings.json";
import { PollStatuses } from "../../enums";
import OpenPrePoll from "../../triggers/openPrePoll";
import OpenPoll from "../../triggers/openPoll";
import ClosePoll from "../../triggers/closePoll";

const changeStateDropdownId = "changestate.dropdown";

export const ChangePollState: Command = {
  name: "change_poll_state",
  description: "changes the bot's status for the poll",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (client: Client, interaction: CommandInteraction) => {
    const dropdown = new StringSelectMenuBuilder()
      .setCustomId(changeStateDropdownId)
      .setPlaceholder("State");

    dropdown.addOptions([
      new StringSelectMenuOptionBuilder()
        .setLabel(`Pre-Poll`)
        .setValue(`${PollStatuses.PrePoll}`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`Poll`)
        .setValue(`${PollStatuses.Polling}`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`Closed`)
        .setValue(`${PollStatuses.Closed}`),
    ]);

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
        i.customId === changeStateDropdownId
      ) {
        if (i.customId === changeStateDropdownId) {
          if (i.values[0] === `${PollStatuses.PrePoll}`) {
            OpenPrePoll(client);
          }
          if (i.values[0] === `${PollStatuses.Polling}`) {
            OpenPoll(client);
          }
          if (i.values[0] === `${PollStatuses.Closed}`) {
            ClosePoll(client);
          }
        }

        i.update({
          content: "State change complete.",
          components: [],
        });
      }
    });
  },
};
