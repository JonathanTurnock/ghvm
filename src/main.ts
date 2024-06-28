import { Command } from "npm:commander@12.1.0";
import packageJson from "../package.json" with {
  type: "json",
};
import { add } from "./commands/add.ts";
import { install } from "./commands/install.ts";

const program = new Command();

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command("add")
  .description("Add a new repsitory the configuration file")
  .action(add);

program
  .command("install")
  .option("--config <config>", "The configuration file to use")
  .option("--tag <tag>", "The tag to install")
  .description("Update the application")
  .action(install);

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await program.parseAsync(["_", "_", ...Deno.args]);

  Deno.exit(0);
}
