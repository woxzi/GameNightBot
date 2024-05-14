import { Command } from "./Command";
import { Poll } from "./commands/Poll";
import { Vote } from "./commands/Vote";
import { Upvote } from "./commands/Upvote";
import { Downvote } from "./commands/Downvote";
import { ResetDb } from "./commands/admin/ResetDb";
import { Suggest } from "./commands/Suggest";
import { ChangePollState } from "./commands/admin/ChangePollState";
import { Attending } from "./commands/Attending";
import { Join } from "./commands/Join";
import { Leave } from "./commands/Leave";
import { RemoveVote } from "./commands/RemoveVote";

export const Commands: Command[] = [
  Poll,
  Vote,
  Upvote,
  Downvote,
  Suggest,
  Attending,
  Join,
  Leave,
  RemoveVote,
  ResetDb,
  ChangePollState,
];
