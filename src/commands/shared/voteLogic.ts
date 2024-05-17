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
import {
  deleteVotesForGame,
  getActiveVotesForUser,
  getCurrentWeekNumber,
  getPollStatus,
  getSuggestionsForWeek,
  saveVote,
} from "../../data";
import { PollStatuses, VoteType } from "../../enums";
import { GetActiveVotesForUser, Suggestion, Vote } from "../../dbModels";
import { GetVotesRemainingString } from "./messageComponents";

const activitiesDropdownId = "vote.activities";
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
  "Tabletop Simulator",
  "Terraria",
  "Satisfactory",
  "Element TD",
];

// returns if validation step was successful
async function DoValidation(
  formState: VoteFormState,
  interaction: CommandInteraction<CacheType>
): Promise<[boolean, string?]> {
  var status = await getPollStatus({ Guild: interaction.guildId as string });

  if (status !== PollStatuses.Polling) {
    return [
      false,
      "The poll is not accepting votes right now. Please check back later.",
    ];
  }

  if (getMaxVotes(formState) <= 0) {
    return [
      false,
      "You have no votes left! Use `/delete_vote` if you want to get rid of your existing votes.",
    ];
  }

  return [true];
}

export default async ({
  client,
  interaction,
  voteType,
  numVotes,
}: VoteLogicParams) => {
  const weekNumber = await getCurrentWeekNumber({
    Guild: interaction.guildId as string,
  });

  const formState: VoteFormState = {
    guild: interaction.guildId as string,
    userId: interaction.user.id,
    votes: numVotes,
    weekNumber: weekNumber,
    remainingUpvotes: await GetRemainingUpvotes({
      Guild: interaction.guildId as string,
      UserId: interaction.user.id,
      WeekNumber: weekNumber,
    }),
    remainingDownvotes: await GetRemainingDownvotes({
      Guild: interaction.guildId as string,
      UserId: interaction.user.id,
      WeekNumber: weekNumber,
    }),
  };

  const [validationSuccessful, validationMessage] = await DoValidation(
    formState,
    interaction
  );
  if (!validationSuccessful) {
    interaction.reply({
      ephemeral: true,
      content: validationMessage,
    });

    return;
  }

  const activities = (await getActivitiesList(interaction)).map((x) => x.Name);

  const maxVotes = getMaxVotes(formState, voteType);

  const response1 = await interaction.reply({
    ephemeral: true,
    content: await getMessageContent(formState),
    components: await getComponentRows({
      activities,
      maxVotes,
      numVotes,
      voteType,
      formState,
    }),
  });

  const dropdownCollector = response1.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
  });

  dropdownCollector.on("collect", async (i) => {
    if (
      i.user.id == response1.interaction.user.id &&
      i.channelId == response1.interaction.channelId
    ) {
      if (i.customId === activitiesDropdownId) {
        formState.game = i.values[0];
      } else if (i.customId === votesDropdownId) {
        formState.votes = Number(i.values[0]);
      }

      i.update({
        content: await getMessageContent(formState),
        components: await getComponentRows({
          activities,
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

  buttonCollector.on("collect", async (i) => {
    await HandleSubmit(formState, i);
    i.update({
      content: getSubmittedMessageContent(),
      components: [],
    });
  });
};

async function HandleSubmit(
  formState: VoteFormState,
  interaction: ButtonInteraction<CacheType>
) {
  formState.votes ??= appsettings.pollConfig.defaultVotes;

  var voteType: VoteType = VoteType.Unknown;
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

  const getActiveVotesArgs = {
    Guild: formState.guild,
    UserId: formState.userId,
    WeekNumber: formState.weekNumber,
  };
  let activeUserVotes = await getActiveVotesForUser(getActiveVotesArgs);

  deleteVotesForGame({
    ...getActiveVotesArgs,
    VotedFor: formState.game as string,
  });

  const currentDbVoteCount = activeUserVotes
    .filter((x) => x.VotedFor === formState.game)
    .map((x) => (x.VoteType === VoteType.Downvote ? -x.VoteCount : x.VoteCount))
    .reduce((partialSum, a) => partialSum + a, 0); // take the sum of all votes for the game

  const votesFromForm =
    voteType === VoteType.Downvote ? -formState.votes : formState.votes;

  const totalVoteValue = currentDbVoteCount + votesFromForm;

  saveVote({
    Guild: interaction.guildId as string,
    DisplayName: interaction.user.displayName,
    UserId: formState.userId,
    VoteCount: Math.abs(totalVoteValue),
    VotedFor: formState.game as string,
    WeekNumber: formState.weekNumber,
    VoteType: totalVoteValue >= 0 ? VoteType.Upvote : VoteType.Downvote,
  });

  // update vote states after submission
  formState.remainingUpvotes = await GetRemainingUpvotes({
    Guild: formState.guild,
    UserId: formState.userId,
    WeekNumber: formState.weekNumber,
  });

  formState.remainingDownvotes = await GetRemainingDownvotes({
    Guild: formState.guild,
    UserId: formState.userId,
    WeekNumber: formState.weekNumber,
  });
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

function getActivitiesDropdown(
  activities: Array<string>,
  initialValue?: string
) {
  var output = new StringSelectMenuBuilder()
    .setCustomId(activitiesDropdownId)
    .setPlaceholder("Select the activity you want to vote for...");

  for (const activity of activities) {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(activity)
      .setValue(activity);

    if (activity === initialValue) {
      option.setDefault(true);
    }

    output.addOptions(option);
  }

  return output;
}

async function getUpVoteButton(formState: VoteFormState) {
  const output = new ButtonBuilder()
    .setCustomId(voteSubmitUpvoteButtonId)
    .setLabel("↑")
    .setStyle(ButtonStyle.Success);

  if (await shouldDisableUpvoteButton(formState)) {
    output.setDisabled(true);
  }

  return output;
}

async function getDownVoteButton(formState: VoteFormState) {
  const output = new ButtonBuilder()
    .setCustomId(voteSubmitDownvoteButtonId)
    .setLabel("↓")
    .setStyle(ButtonStyle.Danger);

  if (await shouldDisableDownvoteButton(formState)) {
    output.setDisabled(true);
  }

  return output;
}

async function getSubmitButton(formState: VoteFormState, voteType: VoteType) {
  const output = new ButtonBuilder()
    .setLabel("Submit")
    .setStyle(ButtonStyle.Primary);

  if (voteType === VoteType.Upvote) {
    output
      .setCustomId(voteSubmitUpvoteButtonId)
      .setDisabled(await shouldDisableUpvoteButton(formState));
  } else if (voteType === VoteType.Downvote) {
    output
      .setCustomId(voteSubmitDownvoteButtonId)
      .setDisabled(await shouldDisableDownvoteButton(formState));
  }

  return output;
}

function getMaxVotes(formState: VoteFormState, voteType?: VoteType) {
  let maxVotes: number;
  if (voteType === VoteType.Upvote) {
    maxVotes = formState.remainingUpvotes;
  } else if (voteType === VoteType.Downvote) {
    maxVotes = formState.remainingDownvotes;
  } else {
    maxVotes = Math.max(
      formState.remainingUpvotes,
      formState.remainingDownvotes
    );
  }
  return maxVotes;
}

async function getActivitiesList(interaction: CommandInteraction<CacheType>) {
  return await getSuggestionsForWeek({
    Guild: interaction.guildId as string,
    WeekNumber: 1,
  });
}

interface GetComponentRowsParams {
  activities: Array<string>;
  maxVotes: number;
  numVotes?: number;
  voteType?: VoteType;
  formState: VoteFormState;
}

interface VoteFormState {
  guild: string;
  userId: string;
  weekNumber: number;
  remainingUpvotes: number;
  remainingDownvotes: number;
  game?: string;
  votes?: number;
}

async function GetTotalVotesOfType(votes: Vote[], voteType: VoteType) {
  return votes
    .filter((x) => x.VoteType === voteType)
    .reduce((partialSum, x) => partialSum + x.VoteCount, 0);
}

async function GetRemainingUpvotes(params: GetActiveVotesForUser) {
  const votes = await getActiveVotesForUser(params);

  const appliedVotes = await GetTotalVotesOfType(votes, VoteType.Upvote);

  return appsettings.pollConfig.maxUpvotes - appliedVotes;
}

async function GetRemainingDownvotes(params: GetActiveVotesForUser) {
  const votes = await getActiveVotesForUser(params);

  const appliedVotes = await GetTotalVotesOfType(votes, VoteType.Downvote);

  return appsettings.pollConfig.maxDownvotes - appliedVotes;
}

function isFormComplete(formState: VoteFormState): boolean {
  return !!formState.game;
}

function shouldDisableUpvoteButton(formState: VoteFormState): boolean {
  const votes = formState.votes ?? appsettings.pollConfig.defaultVotes;
  return !isFormComplete(formState) || votes > formState.remainingUpvotes;
}

function shouldDisableDownvoteButton(formState: VoteFormState): boolean {
  const votes = formState.votes ?? appsettings.pollConfig.defaultVotes;
  return !isFormComplete(formState) || votes > formState.remainingDownvotes;
}

async function getComponentRows({
  activities,
  maxVotes,
  numVotes,
  voteType,
  formState,
}: GetComponentRowsParams) {
  const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    getActivitiesDropdown(activities, formState.game)
  );

  const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    getNumVotesDropdown(maxVotes, formState.votes ?? numVotes)
  );

  const row3 = await getButtonRow(formState, voteType);

  return [row1, row2, row3];
}

async function getButtonRow(formState: VoteFormState, voteType?: VoteType) {
  const output = new ActionRowBuilder<ButtonBuilder>();
  if (!!voteType) {
    output.addComponents(await getSubmitButton(formState, voteType));
  } else {
    output
      .addComponents(await getUpVoteButton(formState))
      .addComponents(await getDownVoteButton(formState));
  }
  return output;
}

async function getMessageContent(formState: VoteFormState) {
  const prefix = "### ";
  const votesRemaining = GetVotesRemainingString(
    formState.remainingUpvotes,
    formState.remainingDownvotes
  );
  if (!formState.game) {
    return prefix + `Please select a game to vote for. ${votesRemaining}`;
  } else if (
    !formState.votes ||
    formState.votes === appsettings.pollConfig.defaultVotes
  ) {
    return prefix + `You are voting for *${formState.game}* ${votesRemaining}`;
  } else {
    return (
      prefix +
      `You are voting ${formState.votes}x for *${formState.game}* ${votesRemaining}`
    );
  }
}

function getSubmittedMessageContent() {
  return "### *Your vote has been recorded.*";
}

export function getSortedVoteTotals(votes: Vote[], suggestions?: Suggestion[]) {
  const voteTotals: { [Key: string]: number } = {};
  for (const vote of votes) {
    const voteAmount =
      vote.VoteType === VoteType.Upvote ? vote.VoteCount : -vote.VoteCount;

    if (vote.VotedFor in voteTotals) {
      voteTotals[vote.VotedFor] += voteAmount;
    } else {
      voteTotals[vote.VotedFor] = voteAmount;
    }
  }

  let votesToSort: Array<[string, number]> = [];
  for (const vote in voteTotals) {
    votesToSort.push([vote, voteTotals[vote]]);
  }

  // inject suggestions nobody voted for if necessary
  if (suggestions) {
    for (const suggestion of suggestions) {
      if (!votesToSort.map((x) => x[0]).includes(suggestion.Name)) {
        votesToSort.push([suggestion.Name, 0]);
      }
    }
  }
  return votesToSort.sort((a, b) => b[1] - a[1]);
}
