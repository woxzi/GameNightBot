import { Database } from "sqlite3";
import {
  DeleteVotesForGame,
  GetActiveVotesForUser,
  GetAllActiveVotes,
  GetCurrentWeekNumber,
  GetCurrentWeekNumberResponse,
  GetPollStatus,
  GetPollStatusResult,
  GetSuggestionsForWeek,
  PollStatus,
  Suggestion,
  Vote,
} from "./dbModels";
import { PollStatusResult, PollStatuses } from "./enums";

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
    `DROP TABLE IF EXISTS Votes;
    CREATE TABLE Votes
    (
        Guild VARCHAR(50) NOT NULL,
        UserId VARCHAR(50) NOT NULL,
        DisplayName VARCHAR(50) NOT NULL,
        VotedFor VARCHAR(400) NOT NULL,
        VoteCount INTEGER NOT NULL,
        VoteType INTEGER NOT NULL,
        WeekNumber INTEGER NOT NULL,
        PRIMARY KEY (Guild, UserId, WeekNumber, VotedFor)
    );`.trim()
  );

  db.exec(
    `DROP TABLE IF EXISTS Suggestions;
    CREATE TABLE Suggestions
    (
        Guild VARCHAR(50) NOT NULL,
        SuggestedByUserId VARCHAR(50) NOT NULL,
        SuggestedByDisplayName VARCHAR(50) NOT NULL,
        Name VARCHAR(400) NOT NULL,
        WeekNumber INTEGER NOT NULL,
        PRIMARY KEY (Guild, SuggestedByUserId, Name, WeekNumber)
    );`.trim()
  );

  db.exec(
    `DROP TABLE IF EXISTS PollStatuses;
    CREATE TABLE PollStatuses
    (
        Guild VARCHAR(50) NOT NULL,
        Status INTEGER NOT NULL,
        ActiveWeek INTEGER NOT NULL,
        PRIMARY KEY (Guild)
    );`.trim()
  );
}

export function saveSuggestion(data: Suggestion) {
  db.run(
    `INSERT INTO Suggestions (Guild, SuggestedByUserId, SuggestedByDisplayName, Name, WeekNumber)
     VALUES($guild, $userid, $displayname, $name, $weeknumber)`,
    {
      $guild: data.Guild,
      $userid: data.SuggestedByUserId,
      $displayname: data.SuggestedByDisplayName,
      $name: data.Name,
      $weeknumber: data.WeekNumber,
    }
  );
}

export async function getPollStatus(params: GetPollStatus): Promise<number> {
  const result = await getPollStatusInternal(params);
  if (result) {
    return result.Status;
  } else {
    console.log("Setting initial poll status");
    await savePollStatus({
      Guild: params.Guild,
      Status: PollStatuses.PrePoll,
      ActiveWeek: 1,
    });

    return PollStatuses.PrePoll as number;
  }
}

async function getPollStatusInternal(
  params: GetPollStatus
): Promise<GetPollStatusResult> {
  return new Promise<GetPollStatusResult>((resolve, reject) => {
    db.get<GetPollStatusResult>(
      `SELECT Status
       FROM PollStatuses
       WHERE Guild = $guild`,
      {
        $guild: params.Guild,
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

export function savePollStatus(data: PollStatus) {
  db.run(
    `INSERT INTO PollStatuses (Guild, Status, ActiveWeek)
  VALUES($guild, $status, $activeweek)
  ON CONFLICT(Guild) DO UPDATE SET
    Status = $status,
    ActiveWeek = $activeweek
  WHERE Guild = $guild`,
    {
      $guild: data.Guild,
      $status: data.Status,
      $activeweek: data.ActiveWeek,
    }
  );
}

export async function getSuggestionsForWeek(
  params: GetSuggestionsForWeek
): Promise<Suggestion[]> {
  return new Promise<Suggestion[]>((resolve, reject) => {
    const output: Suggestion[] = [];
    db.each<Suggestion>(
      `SELECT Guild, SuggestedByUserId, SuggestedByDisplayName, Name, WeekNumber
       FROM Suggestions
       WHERE Guild = $guild
         AND WeekNumber = $weeknumber
       ORDER BY Name`,
      {
        $guild: params.Guild,
        $weeknumber: params.WeekNumber,
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

export async function getCurrentWeekNumber(
  params: GetCurrentWeekNumber
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.get<GetCurrentWeekNumberResponse>(
      `SELECT MAX(ActiveWeek) AS WeekNumber
       FROM PollStatuses
       WHERE Guild = $guild`,
      {
        $guild: params.Guild,
      },
      (error, row) => {
        if (error) {
          reject(error.message);
        } else {
          resolve(row.WeekNumber);
        }
      }
    );
  });
}

export async function getAllActiveVotes(
  params: GetAllActiveVotes
): Promise<Vote[]> {
  return new Promise<Vote[]>((resolve, reject) => {
    const output: Vote[] = [];
    db.each<Vote>(
      `SELECT Guild, UserId, DisplayName, VotedFor, VoteCount, VoteType, WeekNumber
       FROM Votes
       WHERE Guild = $guild
        AND WeekNumber = $weeknumber`,
      {
        $guild: params.Guild,
        $weeknumber: params.WeekNumber,
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

export async function getActiveVotesForUser(
  params: GetActiveVotesForUser
): Promise<Vote[]> {
  return new Promise<Vote[]>((resolve, reject) => {
    const output: Vote[] = [];
    db.each<Vote>(
      `SELECT Guild, UserId, DisplayName, VotedFor, VoteCount, VoteType, WeekNumber
       FROM Votes
       WHERE Guild = $guild
        AND UserId = $userid
        AND WeekNumber = $weeknumber`,
      {
        $guild: params.Guild,
        $userid: params.UserId,
        $weeknumber: params.WeekNumber,
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

export function saveVote(data: Vote) {
  db.run(
    `INSERT INTO Votes (Guild, UserId, DisplayName, VotedFor, VoteCount, VoteType, WeekNumber)
  VALUES($guild, $userid, $displayname, $votedfor, $votecount, $votetype, $weeknumber)
  ON CONFLICT(Guild, UserId, VotedFor, WeekNumber) DO UPDATE SET
    DisplayName = $displayname,
    VoteCount = $votecount,
    VoteType = $votetype
  WHERE Guild = $guild`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $displayname: data.DisplayName,
      $votedfor: data.VotedFor,
      $votecount: data.VoteCount,
      $votetype: data.VoteType,
      $weeknumber: data.WeekNumber,
    }
  );

  db.run(
    `UPDATE Votes
     SET DisplayName = $displayname
     WHERE Guild = $guild
       AND UserId = $userid`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $displayname: data.DisplayName,
    }
  );

  db.run(
    `UPDATE Suggestions
     SET SuggestedByDisplayName = $displayname
     WHERE Guild = $guild
       AND SuggestedByUserId = $userid`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $displayname: data.DisplayName,
    }
  );
}

export function deleteVotesForGame(data: DeleteVotesForGame) {
  db.run(
    `DELETE FROM Votes
     WHERE Guild = $guild
       AND UserId = $userid
       AND VotedFor = $votedfor
       AND WeekNumber = $weeknumber`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $votedfor: data.VotedFor,
      $weeknumber: data.WeekNumber,
    }
  );
}
