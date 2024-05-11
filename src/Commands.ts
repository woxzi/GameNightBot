import { Command } from "./Command";
import { Leaderboard } from "./commands/Leaderboard";
import { Stats } from "./commands/Stats";
import { SetChannel } from "./commands/SetChannel";
import { Settings } from "./commands/Settings";
import { SetTimezone } from "./commands/SetTimezone";

export const Commands: Command[] = [
  SetChannel,
  Stats,
  //ResetDb,
  Leaderboard,
  Settings,
  SetTimezone,
];
