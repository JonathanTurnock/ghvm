import { ConfigEntity } from "./config.entity.ts";
import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "npm:yaml@2.4.5";
import { config } from "./config.ts";

export class ConfigManager {
  /**
   * Loads all configs from the config directory by reading the files ending with the configExtension and adding them to the configs map.
   */
  constructor() {
    this.ensureConfigDir();
  }

  /**
   * Returns an array over all configs.
   */
  getConfigs(): ConfigEntity[] {
    return fs.readdirSync(config.configDir).map((folder: string) =>
      this.loadConfig(folder)
    )
      .filter(Boolean);
  }

  /**
   * Adds a config to the configs map and saves it to the config file.
   */
  addConfig(config: Omit<ConfigEntity, "id">): ConfigEntity {
    const entity = {
      ...config,
      id: `${config.github.owner}__${config.github.repo}`,
    };
    this.saveConfig(entity);
    return entity;
  }

  /**
   * Removes a config from the configs map and deletes the config file.
   */
  removeConfig(config: ConfigEntity) {
    fs.rmSync(this.getConfigFilePath(config.id), {
      force: true,
      recursive: true,
    });
  }

  getPreInstallScriptPath(c: ConfigEntity) {
    return path.join(config.configDir, c.id, config.preInstallFileName);
  }

  getPostInstallScriptPath(c: ConfigEntity) {
    return path.join(config.configDir, c.id, config.postInstallFileName);
  }

  /**
   * Saves a config to a file.
   */
  private saveConfig(config: ConfigEntity) {
    const configFilePath = this.getConfigFilePath(config.id);
    this.ensureDir(path.dirname(configFilePath));
    fs.writeFileSync(configFilePath, stringify(config));
  }

  /**
   * Loads a config from a file.
   * If the config file does not exist, it will return undefined.
   */
  private loadConfig(configId: string): ConfigEntity | undefined {
    const configFilePath = this.getConfigFilePath(configId);
    if (!fs.existsSync(configFilePath)) {
      return undefined;
    }
    return parse(fs.readFileSync(configFilePath, "utf-8"));
  }

  /**
   * Gets the path to a config file by combining the configDir and configExtension with the configId.
   */
  private getConfigFilePath(configId: string) {
    return path.join(config.configDir, configId, config.configFileName);
  }

  /**
   * Ensures that the config directory exists.
   */
  private ensureConfigDir() {
    this.ensureDir(config.configDir);
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export const configManager = new ConfigManager();
