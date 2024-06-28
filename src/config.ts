import path from "node:path";
import os from "node:os";

export const config = {
  configDir: path.join(os.homedir(), ".ghvm"),
  configFileName: "config.yml",
  preInstallFileName: "pre-install.sh",
  postInstallFileName: "post-install.sh",
};
