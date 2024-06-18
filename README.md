# GHVM - Github Version Manager

A tool to manage the download and installation of different versions of software
published on Github Releases.

## Installation

Copy the `ghvm` binary to a directory on your target system.

Copy to `/usr/local/bin` or `/usr/bin` if you want to make it available
system-wide.

Copy to `~/bin` if you want to make it available in your home directory.

## Usage

Run `ghvm init` to initialize the configuration file.

```shell
ghvm init
```

You will be prompted to enter a GitHub Token, Repo owner and Repo name.

It will then connect to the GitHub API and fetch the latest release for the
specified repository.

Once the release is fetched, it will fetch available assets, you must select the
asset you want to have installed and specify the symlink name.

Once the configuration file is created, you can run `ghvm install` to install
the selected asset.

```shell
ghvm install
```

The tool will then download the asset and install it in the specified directory.

```shell
/usr/local/bin/my-app/v1.0.0/my-app-asset (Downloaded Asset)

/usr/local/bin/my-app/my-app-asset -> /usr/local/bin/my-app/v1.0.0/my-app-asset (Symlink to the downloaded asset)
```

> The app will apply the permission of 755 to the asset and the symlink.

## Configuration

The configuration file is created in the current working directory and is named
`.ghvmrc`.

It is a JSON file with the following structure:

```json
{
  "token": "GITHUB_TOKEN", // GitHub Token
  "owner": "OWNER", // GitHub Repo owner
  "repo": "REPO", // GitHub Repo name
  "install_dir": "/usr/local/bin", // Installation directory

  // Assets to install in the installation directory, all other assets will be ignored
  "assets": {
    "ASSET_NAME": "SYMLINK_NAME"
  }
}
```

> The config is resolved and read using `rc` (https://www.npmjs.com/package/rc)
> so the resolution [standards](https://www.npmjs.com/package/rc#standards)
> apply
