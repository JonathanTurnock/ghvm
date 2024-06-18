import { loadConfig } from "../config.ts";
import { Asset, GithubClient } from "../clients/github.client.ts";
import inquirer from "npm:inquirer@9.2.23";
import path from "node:path";
import fs from "node:fs";

type DownloadedAsset = Asset & { tempFilePath: string };

/**
 * Ask the user to select a release from the list of releases.
 * @param releases {string[]} The list of releases to choose from.
 */
function askRelease(releases: string[]): Promise<string> {
  return new Promise((resolve, reject) =>
    inquirer
      .prompt([{
        type: "list",
        name: "release",
        message: "Which release do you want to use?",
        choices: releases,
      }])
      .then(({ release }: { release: string }) => resolve(release)).catch(
        reject,
      )
  );
}

export async function install(
  { tag }: { tag?: string; configPath: string },
) {
  const config = loadConfig();

  const githubClient = new GithubClient(
    config.github.token,
    config.github.owner,
    config.github.repo,
  );

  let releaseTag = tag;
  if (!releaseTag) {
    console.log("Fetching Releases...");
    const releases = await githubClient.getReleases();
    releaseTag = await askRelease(
      releases.map((release) => release.tag_name),
    );
  }

  console.log(`Fetching Release ${releaseTag}`);
  const release = await githubClient.getReleaseByTag(releaseTag);
  console.log(
    `Installing ${release.tag_name} (${release.html_url})`,
  );

  const assetNamesToInstall = Object.keys(config.assets);

  console.log("Fetching Assets...");
  const assets = (await githubClient.getAssets(release)).filter((it) =>
    assetNamesToInstall.includes(it.name)
  );

  console.log("Downloading Assets...");
  const downloadedAssets: DownloadedAsset[] = [];

  for (const asset of assets) {
    console.log(`Downloading ${asset.name} (${asset.browser_download_url})...`);
    const tempFilePath = await githubClient.downloadAsset(asset);
    console.debug(`Downloaded ${asset.name} to ${tempFilePath}`);
    downloadedAssets.push({ ...asset, tempFilePath });
  }

  console.log("Installing Assets...");

  console.log("Executing Pre-Install Script...");

  if (config.preInstall) {
    await Deno.chmod(config.preInstall, 0o755);
    const command = new Deno.Command(config.preInstall, {
      stderr: "inherit",
      stdout: "inherit",
    });
    await command.output();
  }

  for (const asset of downloadedAssets) {
    const { tempFilePath } = asset;

    const targetPath = path.join(
      config.directory,
      release.tag_name,
      asset.name,
    );

    const symlinkPath = path.join(
      config.directory,
      config.assets[asset.name],
    );

    await Deno.mkdir(path.dirname(targetPath), { recursive: true });

    console.debug(`Moving ${tempFilePath} to ${targetPath}`);
    await Deno.rename(tempFilePath, targetPath);

    console.debug(`Symlinking ${targetPath} to ${symlinkPath}`);
    if (fs.existsSync(symlinkPath)) {
      await Deno.remove(symlinkPath);
    }
    await Deno.symlink(targetPath, symlinkPath);
    await Deno.chmod(targetPath, 0o755);
    await Deno.chmod(symlinkPath, 0o755);
  }

  console.log("Executing Post-Install Script...");
  if (config.postInstall) {
    await Deno.chmod(config.postInstall, 0o755);
    const command = new Deno.Command(config.postInstall, {
      stderr: "inherit",
      stdout: "inherit",
    });
    await command.output();
  }

  console.log(`Finished installing ${release.tag_name}...`);
}
