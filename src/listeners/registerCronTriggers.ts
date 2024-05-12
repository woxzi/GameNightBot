import { Client } from "discord.js";
import { CronJob } from "cron";
import appsettings from "../appsettings.json";
import PostPollMessage from "../PostPollMessage";

export default (client: Client) => {
  console.log(appsettings.pollConfig.cronString);

  const jobs = [
    CronJob.from({
      cronTime: appsettings.pollConfig.cronString,
      onTick: function () {
        console.log("Cron job triggered.");
        PostPollMessage(client);
      },
      start: true,
      timeZone: appsettings.appConfig.timezone,
    }),
  ];

  return jobs;
};

// const GetCronValueString = (val?: CronValue) => {
//   if (val === undefined || val === null) {
//     return "*";
//   }

//   if (typeof val === "object") {
//     if (val.Type === CronValueType.Step) {
//       return `*/${val.Value}`;
//     } else {
//       return `${val.Value}`;
//     }
//   } else {
//     return `${val}`;
//   }
// };

// const GetCronString = (config: CronConfiguration): string => {
//   let dayOfWeek = config.dayOfWeek ? DayOfWeek[config.dayOfWeek] : "*";

//   return (
//     GetCronValueString(config.second) +
//     " " +
//     GetCronValueString(config.minute) +
//     " " +
//     GetCronValueString(config.hour) +
//     " " +
//     GetCronValueString(config.dayOfMonth) +
//     " " +
//     GetCronValueString(config.month) +
//     " " +
//     dayOfWeek
//   );
// };

// export interface CronConfiguration {
//   second?: CronValue;
//   minute?: CronValue;
//   hour?: CronValue;
//   dayOfMonth?: CronValue;
//   month?: CronValue;
//   dayOfWeek?: DayOfWeek;
// }

// export type CronValue = CronValueInternal | number;

// interface CronValueInternal {
//   Value: Number;
//   Type: CronValueType;
// }

// export enum CronValueType {
//   SpecifiedTime = 0,
//   Step = 1,
// }

// export enum DayOfWeek {
//   Sunday = 0,
//   Monday = 1,
//   Tuesday = 2,
//   Wednesday = 3,
//   Thursday = 4,
//   Friday = 5,
//   Saturday = 6,
// }
