import {
  CommandInteraction,
  Client,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  CacheType,
  ButtonInteraction,
} from "discord.js";
import appsettings from "../../appsettings.json";
import { getPollStatus } from "src/data";
import { PollStatuses } from "src/dbModels";

const gamesDropdownId = "vote.games";
const votesDropdownId = "vote.numVotes";
const voteSubmitUpvoteButtonId = "vote.submit.upvote";
const voteSubmitDownvoteButtonId = "vote.submit.downvote";

export interface VoteLogicParams {
  client: Client;
  interaction: CommandInteraction;
  voteType?: VoteType;
  numVotes?: number;
}

const gamesForTesting = [
  "Halo",
  "Among Us",
  "Team Fortress 2",
  "Overwatch",
  "Tabletop Simulator Game",
  "Terraria",
  "Satisfactory",
  "Element TD",
];

// returns if validation step was successful
async function DoValidation(
  interaction: CommandInteraction<CacheType>
): Promise<boolean> {
  var status = await getPollStatus({ Guild: interaction.guildId as string });

  if (status !== PollStatuses.Polling) {
    return false;
  }
  return true;
}

export default async ({
  client,
  interaction,
  voteType,
  numVotes,
}: VoteLogicParams) => {
  const validationSuccessful = await DoValidation(interaction);
  if (!validationSuccessful) {
    interaction.reply({
      ephemeral: true,
      content:
        "The poll is not accepting votes right now. Please check back later.",
    });

    return;
  }

  const games = getGamesList();
  const maxVotes = getMaxVotes(voteType);

  const formState: VoteFormState = {
    userId: interaction.user.id,
    votes: numVotes,
  };

  const response1 = await interaction.reply({
    ephemeral: true,
    content: getMessageContent(formState),
    components: getComponentRows({
      games,
      maxVotes,
      numVotes,
      voteType,
      formState,
    }),
  });

  const dropdownCollector = response1.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
  });

  dropdownCollector.on("collect", (i) => {
    console.log("collected");
    if (
      i.user.id == response1.interaction.user.id &&
      i.channelId == response1.interaction.channelId
    ) {
      if (i.customId === gamesDropdownId) {
        formState.game = i.values[0];
      } else if (i.customId === votesDropdownId) {
        formState.votes = Number(i.values[0]);
      }

      i.update({
        content: getMessageContent(formState),
        components: getComponentRows({
          games,
          maxVotes,
          numVotes,
          voteType,
          formState,
        }),
      });
    }
  });

  const buttonCollector = response1.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  buttonCollector.on("collect", (i) => {
    HandleSubmit(formState, i);
    i.update({
      content: getSubmittedMessageContent(),
      components: [],
    });
  });
};

function HandleSubmit(
  formState: VoteFormState,
  interaction: ButtonInteraction<CacheType>
) {
  formState.votes ??= appsettings.pollConfig.defaultVotes;

  let voteType: VoteType;
  let voteArrow: string = "";

  if (interaction.customId === voteSubmitUpvoteButtonId) {
    voteType = VoteType.Upvote;
    voteArrow = "↑";
  } else if (interaction.customId === voteSubmitDownvoteButtonId) {
    voteType = VoteType.Downvote;
    voteArrow = "↓";
  }

  console.log(
    `${interaction.user.displayName ?? interaction.user.globalName} voted ${
      formState.votes
    }${voteArrow} for ${formState.game}`
  );
}

export enum VoteType {
  Upvote = 1,
  Downvote = 2,
}

function getNumVotesDropdown(maxVotes: number, initialValue?: number) {
  const output = new StringSelectMenuBuilder()
    .setCustomId(votesDropdownId)
    .setPlaceholder("# Votes");

  for (let i = 1; i <= maxVotes; i++) {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(`${i}`)
      .setValue(`${i}`);

    if (i === initialValue) {
      option.setDefault(true);
    }

    output.addOptions(option);
  }

  return output;
}

function getGamesDropdown(games: Array<string>, initialValue?: string) {
  var output = new StringSelectMenuBuilder()
    .setCustomId(gamesDropdownId)
    .setPlaceholder("Select the game you want to vote for...");

  for (const game of games) {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(game)
      .setValue(game);

    if (game === initialValue) {
      option.setDefault(true);
    }

    output.addOptions(option);
  }

  return output;
}

function getUpVoteButton(formState: VoteFormState) {
  const output = new ButtonBuilder()
    .setCustomId(voteSubmitUpvoteButtonId)
    .setLabel("↑")
    .setStyle(ButtonStyle.Success);

  if (shouldDisableUpvoteButton(formState)) {
    output.setDisabled(true);
  }

  return output;
}

function getDownVoteButton(formState: VoteFormState) {
  const output = new ButtonBuilder()
    .setCustomId(voteSubmitDownvoteButtonId)
    .setLabel("↓")
    .setStyle(ButtonStyle.Danger);

  if (shouldDisableDownvoteButton(formState)) {
    output.setDisabled(true);
  }

  return output;
}

function getSubmitButton(formState: VoteFormState, voteType: VoteType) {
  const output = new ButtonBuilder()
    .setLabel("Submit")
    .setStyle(ButtonStyle.Primary);

  if (voteType === VoteType.Upvote) {
    output
      .setCustomId(voteSubmitUpvoteButtonId)
      .setDisabled(shouldDisableUpvoteButton(formState));
  } else if (voteType === VoteType.Downvote) {
    output
      .setCustomId(voteSubmitDownvoteButtonId)
      .setDisabled(shouldDisableDownvoteButton(formState));
  }

  return output;
}

function getMaxVotes(voteType?: VoteType) {
  let maxVotes: number;
  if (voteType === VoteType.Upvote) {
    maxVotes = appsettings.pollConfig.maxUpvotes;
  } else if (voteType === VoteType.Downvote) {
    maxVotes = appsettings.pollConfig.maxDownvotes;
  } else {
    maxVotes = Math.max(
      appsettings.pollConfig.maxUpvotes,
      appsettings.pollConfig.maxDownvotes
    );
  }
  return maxVotes;
}

function getGamesList() {
  return gamesForTesting;
}

interface GetComponentRowsParams {
  games: Array<string>;
  maxVotes: number;
  numVotes?: number;
  voteType?: VoteType;
  formState: VoteFormState;
}

interface VoteFormState {
  userId: string;
  game?: string;
  votes?: number;
}

function GetRemainingUpvotes() {
  // fill this out
  return 6;
}
function GetRemainingDownvotes() {
  // fill this out
  return 4;
}

function isFormComplete(formState: VoteFormState): boolean {
  return !!formState.game;
}

function shouldDisableUpvoteButton(formState: VoteFormState): boolean {
  const votes = formState.votes ?? appsettings.pollConfig.defaultVotes;
  return !isFormComplete(formState) || votes > GetRemainingUpvotes();
}

function shouldDisableDownvoteButton(formState: VoteFormState): boolean {
  const votes = formState.votes ?? appsettings.pollConfig.defaultVotes;
  return !isFormComplete(formState) || votes > GetRemainingDownvotes();
}

function getComponentRows({
  games,
  maxVotes,
  numVotes,
  voteType,
  formState,
}: GetComponentRowsParams) {
  const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    getGamesDropdown(games, formState.game)
  );

  const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    getNumVotesDropdown(maxVotes, formState.votes ?? numVotes)
  );

  const row3 = getButtonRow(formState);

  return [row1, row2, row3];
}

function getButtonRow(formState: VoteFormState, voteType?: VoteType) {
  const output = new ActionRowBuilder<ButtonBuilder>();
  if (!!voteType) {
    output.addComponents(getSubmitButton(formState, voteType));
  } else {
    output
      .addComponents(getUpVoteButton(formState))
      .addComponents(getDownVoteButton(formState));
  }
  return output;
}

function getMessageContent(formState: VoteFormState) {
  const prefix = "### ";
  if (!formState.game) {
    return prefix + "Please select a game to vote for.";
  } else if (
    !formState.votes ||
    formState.votes === appsettings.pollConfig.defaultVotes
  ) {
    return prefix + `You are voting for *${formState.game}*`;
  } else {
    return (
      prefix + `You are voting ${formState.votes}x for *${formState.game}*`
    );
  }
}

function getSubmittedMessageContent() {
  return "### *Your vote has been recorded.*";
}
