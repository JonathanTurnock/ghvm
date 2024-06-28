import z from "npm:zod@3.23.8";

export const configEntitySchema = z.object({
  id: z.coerce.string().describe(
    "The unique identifier for the config",
  ),
  github: z.object({
    token: z.coerce.string().describe(
      "The GitHub token to use for authentication",
    ),
    owner: z.coerce.string().describe(
      "The owner of the repository to fetch releases from",
    ),
    repo: z.coerce.string().describe(
      "The name of the repository to fetch releases from",
    ),
  }),
  directory: z.coerce.string().describe(
    "The directory to install the app to",
  ),
  assets: z.record(z.coerce.string(), z.coerce.string()).describe(
    "The assets to install from the release as a map of symlink name to asset name i.e. { 'workmate': 'workmate-macos' }",
  ),
});

export type ConfigEntity = z.infer<typeof configEntitySchema>;
