import { Octokit } from "npm:octokit@4.0.2";
import z from "npm:zod@3.23.8";

const releaseSchema = z.object({
  id: z.number(),
  tag_name: z.string(),
  url: z.string(),
  html_url: z.string(),
});

export type Release = z.infer<typeof releaseSchema>;

const assetSchema = z.object({
  id: z.number(),
  name: z.string(),
  browser_download_url: z.string(),
});
export type Asset = z.infer<typeof assetSchema>;

/**
 * A class for interacting with the GitHub API.
 * This class provides methods for fetching releases from a GitHub repository using the Octokit library.
 */
export class GithubClient {
  /**
   * Octokit client for interacting with the GitHub API.
   */
  private readonly client: Octokit;

  /**
   * Creates a new instance of the GithubClient class.
   * @param token The GitHub token to use for authentication.
   * @param owner The owner of the repository to fetch releases from.
   * @param repo The name of the repository to fetch releases from.
   */
  constructor(
    private token: string,
    private owner: string,
    private repo: string,
  ) {
    this.client = new Octokit({
      auth: this.token,
    });
  }

  /**
   * Fetches all releases from the repo and returns them as an array of objects
   * with the release name as the key and the release id as the value.
   *
   * @returns {Promise<Release[]>} An object with the release name as the key and the release id as the value.
   */
  async getReleases(): Promise<Release[]> {
    const res = await this.client.rest.repos.listReleases({
      owner: this.owner,
      repo: this.repo,
    });

    return z.array(releaseSchema).parse(res.data);
  }

  /**
   * Fetches a release by tag from the repo and returns it as an object
   * with the release name as the key and the release id as the value.
   *
   * @param tag The tag of the release to fetch.
   * @returns {Promise<Release>} The release object.
   */
  async getReleaseByTag(tag: string): Promise<Release> {
    const res = await this.client.rest.repos.getReleaseByTag({
      tag,
      owner: this.owner,
      repo: this.repo,
    });

    return releaseSchema.parse(res.data);
  }

  /**
   * Fetches the latest release from the repo and returns it
   *
   * @returns {Promise<Release>} The latest release object.
   */
  async getLatestRelease(): Promise<Release> {
    const res = await this.client.rest.repos.getLatestRelease({
      owner: this.owner,
      repo: this.repo,
    });

    return releaseSchema.parse(res.data);
  }

  /**
   * Fetches all assets for a given release and returns them as an array of objects
   * with the asset name as the key and the asset id as the value.
   *
   * @param release The release to fetch assets for.
   * @returns {Promise<Asset[]>} An array of objects with the asset name as the key and the asset id as the value.
   */
  async getAssets(
    release: Release,
  ): Promise<Asset[]> {
    const res = await this.client.rest.repos.getRelease({
      release_id: release.id,
      owner: this.owner,
      repo: this.repo,
    });

    return z.array(assetSchema).parse(res.data.assets);
  }

  /**
   * Downloads an asset from the repo and returns the path to the downloaded file.
   *
   * @param asset {Asset} The asset to download.
   * @returns {Promise<string>} The path to the downloaded file.
   */
  async downloadAsset(asset: Asset): Promise<string> {
    const tempFilePath = await Deno.makeTempFile();

    const res = await this.client.rest.repos.getReleaseAsset({
      asset_id: asset.id,
      owner: this.owner,
      repo: this.repo,
      mediaType: { format: "application/octet-stream" },
      headers: { accept: "application/octet-stream" },
    });

    const downloadData = res.data as unknown as ArrayBuffer;

    await Deno.writeFile(tempFilePath, new Uint8Array(downloadData));

    return tempFilePath;
  }
}
