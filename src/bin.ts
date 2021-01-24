import { Config } from "./config";
import meow from "meow";
import { resolve } from "path";
import { create } from ".";

const cli = meow(
  `
  Usage
    $ create-factorio-mod <project-name>

  Options
    --dirname, -d  directory to create the project in
    --factorioVersion, -V  factorio version

  Examples
    $ create-factorio-mod destroy-all-biters
`,
  {
    flags: {
      dirname: {
        type: "string",
        alias: "d",
      },
      factorioVersion: {
        type: "string",
        alias: "V",
      },
    },
  }
);

async function go() {
  const projectName = cli.input[0];
  if (!projectName || typeof projectName !== "string")
    throw new Error(`invalid projectName ${projectName}`);
  const config: Config = {
    dirname: cli.flags.dirname || resolve(process.cwd(), projectName),
    projectName,
    factorioVersion: cli.flags.factorioVersion || "1.0",
  };
  try {
    await create(config);
  } catch (err) {
    console.error(`failed to create new project: ${projectName}\n\n\n`);
    console.error(err);
    process.exit(1);
  }
}

go();
