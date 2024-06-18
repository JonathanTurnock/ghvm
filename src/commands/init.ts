import inquirer from "npm:inquirer@9.2.23";
import { GithubClient } from "../clients/github.client.ts";
import { generateValidConfig } from "../config.ts";
import { PROGRAM_NAME } from "../constants.ts";

export async function init() {
  console.log("Initializing...");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "token",
      message: "What is your GitHub token?",
    },
    {
      type: "input",
      name: "owner",
      message: "Who is the owner of the repository?",
    },
    {
      type: "input",
      name: "repo",
      message: "What is the name of the repository?",
    },
    {
      type: "input",
      name: "installDirectory",
      message: "What is the directory to install the app to?",
    },
  ]);

  console.log("Fetching the latest release...");
  const githubClient = new GithubClient(
    answers.token,
    answers.owner,
    answers.repo,
  );

  const release = await githubClient.getLatestRelease();
  console.log(`Found latest release ${release.tag_name}, Fetching Assets...`);

  const releaseAssets = (await githubClient.getAssets(release)).map((it) => ({
    ...it,
    displayName: `${it.name} (${it.id})`,
  }));

  const { assets: assetNames } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "assets",
      message: "Which assets do you want to install?",
      choices: releaseAssets.map((it) => it.displayName),
    },
  ]);

  const selectedReleaseAssets = releaseAssets.filter((it) =>
    assetNames.includes(it.displayName)
  );

  const assets = await new Promise<Record<string, string>>((resolve) =>
    inquirer.prompt(
      selectedReleaseAssets.map((asset) => ({
        type: "input",
        name: asset.name,
        message: `What should the alias be for ${asset.name}?`,
        default: asset.name,
      })),
    ).then(resolve)
  );

  const config: string = JSON.stringify(
    generateValidConfig({
      github: {
        token: answers.token,
        owner: answers.owner,
        repo: answers.repo,
      },
      directory: answers.installDirectory,
      assets,
    }),
    undefined,
    2,
  );

  console.log("Generating config file...");

  await Deno.writeTextFile(`.${PROGRAM_NAME}rc`, config, { create: true });
}
