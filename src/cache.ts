import { queryClient } from "./Bot";

import {
  getGuildConfig as getGuildConfigFromDB,
  saveGuildConfig as saveGuildConfigToDB,
} from "./data";

const queryKeys = {
  getGuildConfig: (guild: string) => ["getGuildConfig", guild],
};

export async function getGuildConfig(
  guild: string
): Promise<GuildConfiguration> {
  console.log(
    `fetching from cache with key: ${JSON.stringify(
      queryKeys.getGuildConfig(guild)
    )}`
  );
  //console.log(queryClient.getQueryCache());
  return await queryClient.fetchQuery(
    queryKeys.getGuildConfig(guild),
    async () => await getGuildConfigFromDB(guild)
  );
}

export async function saveGuildConfig(config: GuildConfiguration) {
  const mutation = queryClient
    .getMutationCache()
    .build<void, null, GuildConfiguration, null>(queryClient, {
      mutationFn: async (data) => {
        console.log("saving config");
        saveGuildConfigToDB(data);
      },
      onSuccess: (data, variables, context) => {
        console.log("successfully saved config");
        queryClient.invalidateQueries({
          queryKey: queryKeys.getGuildConfig(variables.Guild),
        });
      },
      variables: config,
    });
  mutation.execute();
}
