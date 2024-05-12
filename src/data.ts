import { Database } from "sqlite3";

const filepath = "./database/store.db";
const db = getConnection();

function getConnection() {
  const db = new Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
  });
  console.log("Connection with SQLite has been established");
  return db;
}

export function resetDbFile() {
  db.exec(
    `DROP TABLE IF EXISTS Players;
    CREATE TABLE Votes
    (
        Guild VARCHAR(50) NOT NULL,
        UserId VARCHAR(50) NOT NULL,
        DisplayName VARCHAR(50) NOT NULL,
        VotedFor VARCHAR(400) NOT NULL,
        PointTotal INTEGER NOT NULL,
        PRIMARY KEY (Guild, UserId)
    );`.trim()
  );
  db.exec(
    `DROP TABLE IF EXISTS GuildConfigurations;
    CREATE TABLE GuildConfigurations
    (
        Guild VARCHAR(50) PRIMARY KEY,
        TargetChannelId VARCHAR(50) NULL,
        Timezone VARCHAR(50) NULL
    );`.trim()
  );
  db.exec(
    `DROP TABLE IF EXISTS DailyStatus;
    CREATE TABLE DailyStatus
    (
        Guild VARCHAR(50) NOT NULL,
        Date INTEGER NOT NULL,
        UserId VARCHAR(50) NOT NULL,
        DisplayName VARCHAR(50) NOT NULL,
        Place INTEGER NOT NULL,
        PRIMARY KEY (Guild, Date, UserId)
    );`.trim()
  );
}

export function getPlayerStats(params: UserData): Promise<PlayerData> {
  return new Promise<PlayerData>((resolve, reject) => {
    db.get<PlayerData>(
      `SELECT Guild, UserId, DisplayName, WinTotal, PointTotal 
       FROM Players
       WHERE Guild = $guild
        AND UserId = $userid`,
      {
        $guild: params.Guild,
        $userid: params.UserId,
      },
      (error, row) => {
        if (error) {
          reject(error.message);
        } else {
          resolve(row);
        }
      }
    );
  });
}

export function GetDefaultGuildConfig(guild: string): GuildConfiguration {
  return {
    Guild: guild,
    TargetChannelId: undefined,
    Timezone: "UTC",
  };
}

export function getGuildConfig(guild: string): Promise<GuildConfiguration> {
  console.log("fetched from db");
  return new Promise<GuildConfiguration>((resolve, reject) => {
    db.get<GuildConfiguration>(
      `SELECT Guild, TargetChannelId, Timezone
       FROM GuildConfigurations
       WHERE Guild = $guild`,
      {
        $guild: guild,
      },
      (error, row) => {
        if (error) {
          reject(error.message);
        } else if (!row) {
          const config = GetDefaultGuildConfig(guild);
          saveGuildConfig(config);
          resolve(config);
        } else {
          resolve(row);
        }
      }
    );
  });
}

export function saveGuildConfig(data: GuildConfiguration) {
  db.run(
    `INSERT INTO GuildConfigurations (Guild, TargetChannelId, Timezone)
  VALUES($guild, $targetChannelId, $timezone)
  ON CONFLICT(Guild) DO UPDATE SET
    TargetChannelId = $targetChannelId,
    Timezone = $timezone
  WHERE Guild = $guild`,
    {
      $guild: data.Guild,
      $targetChannelId: data.TargetChannelId,
      $timezone: data.Timezone,
    }
  );
}

export async function getAllPlayerData(guild: string): Promise<PlayerData[]> {
  return new Promise<PlayerData[]>((resolve, reject) => {
    const results: PlayerData[] = [];
    db.each<PlayerData>(
      `SELECT Guild, UserId, DisplayName, WinTotal, PointTotal 
         FROM Players
         WHERE Guild = $guild
         ORDER BY PointTotal DESC
         LIMIT 10`,
      { $guild: guild },
      (error, row) => {
        if (error) {
          console.log("errored:");
          console.error(error.message);
          reject(error.message);
        } else {
          results.push(row);
        }
      },
      () => {
        resolve(results);
      }
    );
  });
}

export function addPlayerPoints(data: AddPlayerPointsRequest) {
  db.run(
    `INSERT INTO DailyStatus (Guild, Date, UserId, DisplayName, Place)
  VALUES($guild, $date, $userid, $displayName, $place)
  ON CONFLICT(Guild, Date, UserId) DO UPDATE SET
    DisplayName = $displayName,
    Place = $place
  WHERE Guild = $guild
  AND Date = $date
  AND UserId = $userid;`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $date: data.Date,
      $displayName: data.DisplayName,
      $place: data.Place,
    }
  );

  db.run(
    `INSERT INTO Players (Guild, UserId, DisplayName, WinTotal, PointTotal)
  VALUES($guild, $userid, $displayName, $winPoints, $points)
  ON CONFLICT(Guild, UserId) DO UPDATE SET
    DisplayName = $displayName,
    WinTotal = WinTotal + $winPoints,
    PointTotal = PointTotal + $points
  WHERE Guild = $guild
  AND UserId = $userid;`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $displayName: data.DisplayName,
      $winPoints: data.Winner ? 1 : 0,
      $points: data.Points,
    }
  );
}

export function getDailyStatus(
  params: DailyStatusRequest
): Promise<DailyStatus[]> {
  return new Promise<DailyStatus[]>((resolve, reject) => {
    const output: DailyStatus[] = [];
    db.each<DailyStatus>(
      `SELECT Guild, UserId, Date, Place
       FROM DailyStatus
       WHERE Guild = $guild
          AND Date = $date`,
      {
        $guild: params.Guild,
        $date: params.Date,
      },
      (error, row) => {
        if (error) {
          reject(error.message);
        } else if (row) {
          output.push(row);
        }
      },
      () => {
        resolve(output);
      }
    );
  });
}
