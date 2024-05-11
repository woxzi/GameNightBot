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
import { Command } from "../Command";
import { getGuildConfig, saveGuildConfig } from "../cache";

const customDropdownId = "timezone";

export const SetTimezone: Command = {
  name: "set_timezone",
  description: "Sets the timezone that the bot uses to determine when to reset",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (client: Client, interaction: CommandInteraction) => {
    var select = new StringSelectMenuBuilder()
      .setCustomId(customDropdownId)
      .setPlaceholder("Select your timezone");

    const timezones = [
      "UTC",
      "AHST",
      "YST",
      "AKST",
      "PST",
      "MST",
      "CST",
      "EST",
    ];
    for (const timezone of timezones) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(timezone)
          .setValue(timezone)
      );
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      select
    );

    const response = await interaction.reply({
      ephemeral: true,
      content: "Please select your timezone",
      components: [row],
      fetchReply: true,
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 3_600_000,
    });

    collector.on("collect", async (i) => {
      const selection = i.values[0];
      const config = await getGuildConfig(interaction.guildId!);
      config.Timezone = selection;
      await saveGuildConfig(config);
      await interaction.deleteReply();
      await i.reply({
        content: `The timezone has been set to ${selection}`,
        ephemeral: true,
      });
    });
  },
};
