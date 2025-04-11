import chalk from "chalk";
import { spawn } from "child_process";

// Execute a command
export function executeCmd(
  cmd: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      cwd,
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`${cmd} ${args.join(" ")} failed with exit code ${code}`)
        );
        return;
      }
      resolve();
    });
  });
}

// -- String utils --

// program.usage(...)
export const usageString = () =>
  `${chalk.green("<project-directory>")} [options]`;

// program.option("--template <path-to-template>", ...)
export const templateDescriptionString = () =>
  `specify a template for the created project`;

// program.on("--help", () => ...)
const helpString = () => `Only ${chalk.green(
  "<project-directory>"
)} is required.

    A custom ${chalk.cyan("--template")} can be one of:
      - a custom template published on npm: ${chalk.green(
        "mcpi-template-default"
      )}
      - a local path relative to the current working directory: ${chalk.green(
        "file:../my-custom-template"
      )}

    If you have any problems, do not hesitate to file an issue:
      ${chalk.cyan("https://github.com/stephencme/mcp-init/issues/new")}`;

// Specify project directory string
const specifyProjectDirectoryString = (programName: string) =>
  `Please specify the project directory:
  ${chalk.cyan(programName)} ${chalk.green("<project-directory>")}

For example:
  ${chalk.cyan(programName)} ${chalk.green("my-mcp-server")}

Run ${chalk.cyan(`${programName} --help`)} to see all options.`;

// Invalid package name string
const invalidPackageNameString = (projectName: string, problems: string[]) =>
  `Could not create a project called ${chalk.red(
    `"${projectName}"`
  )} because of npm naming restrictions:
${problems.map((p) => `    ${chalk.red.bold("*")} ${p}`).join("\n")}`;

// Directory exists
const directoryExistsString = (path: string) =>
  `The directory ${chalk.green(
    path
  )} already exists. Please use a different directory name.`;

// Creating server string
const creatingServerString = (path: string) =>
  `Creating a new MCP server in ${chalk.green(path)}.`;

// Confirm template string
const confirmTemplateString = (templateName: string) =>
  `Using template ${chalk.green(templateName)}.`;

// Success string
const successString = (projectName: string, path: string) =>
  `Success! Created ${chalk.green(projectName)} at ${chalk.green(path)}
Inside that directory, you can run several commands:

  ${chalk.cyan("npm start")}
    Build MCP server AND watch for changes.

  ${chalk.cyan("npm run build")}
    Build MCP server.

  ${chalk.cyan("npm run setup")}
    Setup MCP clients: Cursor, Windsurf, Claude Desktop.

We suggest that you begin by typing:

  ${chalk.cyan("cd")} ${projectName}

  ${chalk.cyan("npm start")}

Happy hacking!`;

// -- Print utils --

type ConsoleMethod = keyof Pick<
  Console,
  "debug" | "error" | "info" | "log" | "warn"
>;

// Call console.log separately for each line of string
export function print(text: string, method: ConsoleMethod = "log") {
  const lines = text.split("\n");
  lines.forEach((line) => {
    console[method](line);
  });
}

export const printHelp = () => print(helpString());

export const printSpecifyProjectDirectory = (programName: string) =>
  print(specifyProjectDirectoryString(programName));

export const printIsInvalidPackageName = (
  projectName: string,
  problems: string[]
) => print(invalidPackageNameString(projectName, problems), "error");

export const printDirectoryExists = (path: string) =>
  print(directoryExistsString(path), "error");

export const printCreatingServer = (path: string) =>
  print(creatingServerString(path));

export const printUsingTemplate = (templateName: string) =>
  print(confirmTemplateString(templateName));

export const printSuccess = (projectName: string, path: string) =>
  print(successString(projectName, path));
