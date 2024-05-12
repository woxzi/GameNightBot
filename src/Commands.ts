import { Command } from "./Command";
import { Poll } from "./commands/Poll";
import { Vote } from "./commands/Vote";
import { Upvote } from "./commands/Upvote";
import { Downvote } from "./commands/Downvote";
import { ResetDb } from "./commands/ResetDb";

export const Commands: Command[] = [Poll, Vote, Upvote, Downvote, ResetDb];
