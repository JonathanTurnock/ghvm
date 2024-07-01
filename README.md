# GHVM - Github Version Manager

A tool to manage the download and installation of different versions of software
published on Github Releases.

## Installation

Copy the `ghvm` binary to a directory on your target system.

Copy to `/usr/local/bin` or `/usr/bin` if you want to make it available
system-wide.

Copy to `~/bin` if you want to make it available in your home directory.

## Usage

Run `ghvm add` to add a new configuration.

```shell
ghvm add
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

The tool will then download the asset and install it in the specified directory, i.e. if the install location is defined a `/usr/local/bin`.

It will also symlink the asset from the release to the chosen name

```shell
/usr/local/bin/$REPO_OWNER__$REPO_NAME/v1.0.0/my-app-asset (Downloaded Asset)

/usr/local/bin/my-app-asset -> /usr/local/bin/$REPO_OWNER__$REPO_NAME/v1.0.0/my-app-asset (Symlink to the downloaded asset)
```

> The app will apply the permission of 755 to the asset and the symlink.

## Configuration

The configuration is located in the user working directory under `.ghvm`

CD into the respective Folder for the repo i.e. cd `~/.ghvm/$OWNER__$NAME/

The config exists in a `config.yml` file

```yml
id: $TOKEN_$OWNER
github:
  token: $TOKEN
  owner: $OWNER
  repo: $REPO
directory: /usr/local/bin
assets:
  $RELEASE_ASSET: $SYMLINK NAME
```
