import inquirer from "npm:inquirer@9.2.23";
import { GithubClient } from "../clients/github.client.ts";
import { configManager } from "../config.manager.ts";
import fs from "node:fs";

export async function add() {
  console.log("Adding a new configuration...");

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

  console.log("Adding config...");

  const config = configManager.addConfig({
    github: {
      token: answers.token,
      owner: answers.owner,
      repo: answers.repo,
    },
    directory: answers.installDirectory,
    assets,
  });

  console.log("Configuration added successfully!");

  console.log("Creating pre-install script...");
  const preInstallScriptPath = configManager.getPreInstallScriptPath(config);
  fs.writeFileSync(
    preInstallScriptPath,
    `#!/bin/sh\n\necho 'Pre Install Script - ${preInstallScriptPath}'\n`,
  );
  console.log("Pre-install script created successfully!");

  console.log("Creating post-install script...");
  const postInstallScriptPath = configManager.getPostInstallScriptPath(config);
  fs.writeFileSync(
    postInstallScriptPath,
    `#!/bin/sh\n\necho 'Post Install Script - ${postInstallScriptPath}'\n`,
  );
  console.log("Post-install script created successfully!");
}
