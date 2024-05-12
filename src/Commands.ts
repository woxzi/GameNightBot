import { Command } from "./Command";
import { Stats } from "./commands/Stats";
import { Vote } from "./commands/Vote";
import { Upvote } from "./commands/Upvote";
import { Downvote } from "./commands/Downvote";
import { Test } from "./commands/Test";
import { ResetDb } from "./commands/ResetDb";

export const Commands: Command[] = [
  Stats,
  Vote,
  Upvote,
  Downvote,
  Test,
  ResetDb,
];
