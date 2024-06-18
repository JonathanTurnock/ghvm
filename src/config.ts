import z from "npm:zod@3.23.8";
import rc from "npm:rc@1.2.8";
import packageJson from "../package.json" with {
  type: "json",
};

const configSchema = z.object({
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

export type Config = z.infer<typeof configSchema>;

export function generateValidConfig(config: Config): Config {
  return configSchema.parse(config);
}

/**
 * Loads the configuration from the config file.
 * @returns {Promise<Config>} The configuration object.
 */
export function loadConfig(): Config {
  try {
    const configs = rc(packageJson.name);

    if (!configs.config) {
      throw new Error("Config file not found, run ghvm init to create one");
    }

    return configSchema.parse(configs);
  } catch (error) {
    console.error("Invalid configuration.");
    console.error(error.message);
    Deno.exit(1);
  }
}
