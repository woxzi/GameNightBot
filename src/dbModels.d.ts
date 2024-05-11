interface UserData {
  Guild: string;
  UserId: string;
  DisplayName?: string;
}

interface PlayerData extends UserData {
  WinTotal: number;
  PointTotal: number;
}

interface AddPlayerPointsRequest extends UserData {
  Winner: boolean;
  Points: number;
  Place: number;
  Date: number;
}

interface GuildConfiguration {
  Guild: string;
  TargetChannelId?: string;
  Timezone: string;
}

interface DailyStatus {
  Guild: string;
  UserId: string;
  Date: number;
  Place: number;
}

interface DailyStatusRequest {
  Guild: string;
  Date: number;
}
