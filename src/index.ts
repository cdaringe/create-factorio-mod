import { Config } from "./config";
import { promises as fs } from "fs";
import { resolve } from "path";
import execa from "execa";

const asInstallString = (deps: Record<string, string>) =>
  Object.entries(deps)
    .map(([k, v]) => `${k}@${v}`)
    .join(" ");

const devDeps = {
  typescript: "latest",
  "factorio-type-kit": "latest",
  "npm-run-all": "latest",
  "typescript-to-lua": "latest",
};

const getPaths = (config: Config) => {
  return {
    packageJson: resolve(config.dirname, "package.json"),
    readme: resolve(config.dirname, "readme.md"),
    tsconfig: resolve(config.dirname, "tsconfig.json"),
    mod: {
      controlTs: resolve(config.dirname, "control.ts"),
      infoJson: resolve(config.dirname, "info.json"),
    },
  };
};

const defaultControlTs =
  `
const onTick = (_evt: OnTickPayload) => {
  game.print(serpent.block({ hello: "world", its_nice: "to see you" }))
};

script.on_event(defines.events.on_tick, onTick);
`.trim() + "\n";

const defaultTsconfig = {
  compilerOptions: {
    target: "esnext",
    lib: ["esnext"],
    moduleResolution: "node",
    strict: true,
    sourceMap: true,
  },
  tstl: {
    luaTarget: "JIT",
    noHeader: true,
    noImplicitSelf: true,
  },
  include: ["./**/*", "./node_modules/factorio-type-kit/factorio.d.ts"],
};

const createInfoJson = (config: Config) => ({
  name: config.projectName,
  version: "0.0.0",
  title: config.projectName,
  author: "your-name-here",
  factorio_version: "1.0",
  dependencies: [],
  package: {
    scripts: {},
  },
});

export const create = async (config: Config) => {
  await fs.mkdir(config.dirname, { recursive: true });
  const packageJson = {
    name: config.projectName,
    license: "MIT",
    devDependencies: {},
    scripts: {
      "compile:watch": "tstl --watch",
      start: "run-p compile:watch",
    },
  };
  const paths = getPaths(config);
  await Promise.all([
    fs.writeFile(
      paths.packageJson,
      JSON.stringify(packageJson, null, 2) + "\n"
    ),
    fs.writeFile(
      paths.readme,
      `# ${config.projectName}\n\nThe world's next best factorio mod!\n\nCreated with [create-factorio-mod](https://github.com/cdaringe/create-factorio-mod).\n`
    ),
    fs.writeFile(
      paths.tsconfig,
      JSON.stringify(defaultTsconfig, null, 2) + "\n"
    ),
    fs.writeFile(paths.mod.controlTs, defaultControlTs),
    fs.writeFile(
      paths.mod.infoJson,
      JSON.stringify(createInfoJson(config), null, 2) + "\n"
    ),
  ]);
  const [yarnCmd, ...yarnArgs] = `yarn add --dev ${asInstallString(
    devDeps
  )}`.split(" ");
  await execa(yarnCmd, yarnArgs, { stdio: "inherit", cwd: config.dirname });

  console.log(
    [
      `\nVictory! Your mod is ready to roll. Execute the following commands to get going:`,
      `  - cd "${config.dirname}"`,
      `  - yarn start`,
    ].join("\n")
  );
};
