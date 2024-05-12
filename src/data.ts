import { Database } from "sqlite3";
import {
  DeleteVotesForGame,
  GetActiveUserVotesForGame,
  GetActiveVotesForUser,
  GetActiveVotesForUserIgnoringSpecificGame,
  GetAllActiveVotes,
  GetCurrentWeekNumber,
  GetPollStatus,
  GetSuggestionsForWeek,
  PollStatus,
  PollStatuses,
  Suggestion,
  Vote,
} from "./dbModels";

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
        PRIMARY KEY (Guild)
    );`.trim()
  );
}

export async function getPollStatus(params: GetPollStatus): Promise<number> {
  return new Promise<PollStatuses>((resolve, reject) => {
    db.get<PollStatuses>(
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
    `INSERT INTO PollStatuses (Guild, Status)
  VALUES($guild, $status)
  ON CONFLICT(Guild) DO UPDATE SET
    Status = $status
  WHERE Guild = $guild`,
    {
      $guild: data.Guild,
      $status: data.Status,
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

export async function getCurrentWeekNumber(
  params: GetCurrentWeekNumber
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.get<number>(
      `SELECT MAX(WeekNumber)
       FROM Suggestions
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

export async function getAllActiveVotes(
  params: GetAllActiveVotes
): Promise<Vote[]> {
  return new Promise<Vote[]>((resolve, reject) => {
    const output: Vote[] = [];
    db.each<Vote>(
      `SELECT Guild, UserId, DisplayName, VotedFor, VoteCount, WeekNumber
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
      `SELECT Guild, UserId, DisplayName, VotedFor, VoteCount, WeekNumber
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

export async function getActiveVotesForUserIgnoringSpecificGame(
  params: GetActiveVotesForUserIgnoringSpecificGame
): Promise<Vote[]> {
  return new Promise<Vote[]>((resolve, reject) => {
    const output: Vote[] = [];
    db.each<Vote>(
      `SELECT Guild, UserId, DisplayName, VotedFor, VoteCount, WeekNumber
       FROM Votes
       WHERE Guild = $guild
        AND UserId = $userid
        AND WeekNumber = $weeknumber
        AND VotedFor != $votedfor`,
      {
        $guild: params.Guild,
        $userid: params.UserId,
        $weeknumber: params.WeekNumber,
        $votedfor: params.VotedFor,
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

export async function getActiveUserVotesForGame(
  params: GetActiveUserVotesForGame
): Promise<Vote> {
  return new Promise<Vote>((resolve, reject) => {
    db.get<Vote>(
      `SELECT Guild, UserId, DisplayName, VotedFor, VoteCount, WeekNumber
       FROM Votes
       WHERE Guild = $guild
        AND UserId = $userid
        AND WeekNumber = $weeknumber
        AND VotedFor = $votedfor`,
      {
        $guild: params.Guild,
        $userid: params.UserId,
        $weeknumber: params.WeekNumber,
        $votedfor: params.VotedFor,
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

export function saveVote(data: Vote) {
  db.run(
    `INSERT INTO Votes (Guild, UserId, DisplayName, VotedFor, VoteCount, WeekNumber)
  VALUES($guild, $userid, $displayname, $votedfor, $votecount, $weeknumber)
  ON CONFLICT(Guild, UserId, VotedFor, WeekNumber) DO UPDATE SET
    DisplayName = $displayname
    VoteCount = $votecount,
  WHERE Guild = $guild`,
    {
      $guild: data.Guild,
      $userid: data.UserId,
      $displayname: data.DisplayName,
      $votedfor: data.VotedFor,
      $votecount: data.VoteCount,
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
     SET DisplayName = $displayname
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
