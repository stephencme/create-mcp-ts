#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import validatePackageName from "validate-npm-package-name";
import {
  executeCmd,
  printCreatingServer,
  printDirectoryExists,
  printHelp,
  printIsInvalidPackageName,
  printSpecifyProjectDirectory,
  printSuccess,
  printUsingTemplate,
  templateDescriptionString,
  usageString,
} from "./utils.js";

// Load package.json for version and name information
const packageJson = require("../package.json") as any;

let projectDir = "";

// Setup command line interface using commander
const program = new Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(usageString())
  .option("--template <path-to-template>", templateDescriptionString())
  .allowUnknownOption()
  .on("--help", () => printHelp())
  .action((_projectDir) => {
    projectDir = _projectDir;
  })
  .parse();

const options = program.opts();

// Helper function to handle special file names during template copying
function getDestinationFileName(srcFileName: string): string {
  // Handle special cases for template files
  if (srcFileName === "gitignore") {
    return ".gitignore";
  }
  return srcFileName;
}

async function run() {
  // Clean up project directory string input
  if (typeof projectDir === "string") {
    projectDir = projectDir.trim();
  }

  // Ensure project directory was provided
  if (!projectDir) {
    printSpecifyProjectDirectory(program.name());
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectDir);
  const projectName = path.basename(resolvedProjectPath);

  // Validate the project name is a valid npm package name
  const nameValidation = validatePackageName(projectName);
  const valid = nameValidation.validForNewPackages;
  const problems = [
    ...(nameValidation.errors || []),
    ...(nameValidation.warnings || []),
  ];

  if (!valid) {
    printIsInvalidPackageName(projectName, problems);
    process.exit(1);
  }

  // Check if directory already exists
  if (fs.existsSync(resolvedProjectPath)) {
    printDirectoryExists(resolvedProjectPath);
    process.exit(1);
  }

  // Create project directory
  fs.ensureDirSync(resolvedProjectPath);

  printCreatingServer(resolvedProjectPath);

  // Determine which template to use (default or custom)
  const templateName = options.template || "mcp-ts-template-default";
  printUsingTemplate(templateName);

  // Copy template contents
  console.log(`Installing template from ${templateName}...`);

  try {
    // Handle local template (file:) vs npm package
    if (templateName.startsWith("file:")) {
      const localTemplatePath = path.resolve(templateName.slice(5));
      if (!fs.existsSync(localTemplatePath)) {
        console.error(
          `Local template path does not exist: ${localTemplatePath}`
        );
        process.exit(1);
      }
      // Copy files with special file name handling
      const templateFiles = fs
        .readdirSync(localTemplatePath)
        .filter((file) => !["node_modules", ".git"].includes(file));

      templateFiles.forEach((file) => {
        const srcPath = path.join(localTemplatePath, file);
        const destPath = path.join(
          resolvedProjectPath,
          getDestinationFileName(file)
        );
        fs.copySync(srcPath, destPath);
      });
    } else {
      // For npm packages, first create a package.json
      const tempPackageJson = {
        dependencies: {
          [templateName]: "latest",
        },
      };

      fs.writeFileSync(
        path.join(resolvedProjectPath, "package.json"),
        JSON.stringify(tempPackageJson, null, 2)
      );

      // Install the template package
      await executeCmd("npm", ["install"], resolvedProjectPath);

      // Copy template contents from node_modules to project directory
      const templatePath = path.join(
        resolvedProjectPath,
        "node_modules",
        templateName
      );
      const templateFiles = fs
        .readdirSync(templatePath)
        .filter((file) => !["node_modules", ".git"].includes(file));

      // Copy each file/directory from the template with special file name handling
      templateFiles.forEach((file) => {
        const srcPath = path.join(templatePath, file);
        const destPath = path.join(
          resolvedProjectPath,
          getDestinationFileName(file)
        );
        fs.copySync(srcPath, destPath);
      });

      // Clean up after template installation
      await executeCmd("npm", ["uninstall", templateName], resolvedProjectPath);
    }

    console.log("Template copied successfully.");
    console.log();
  } catch (error) {
    console.error("Failed to copy template:", error);
    process.exit(1);
  }

  // Update package.json with project name and version
  try {
    const projectPackageJson = {
      name: projectName,
      version: "0.1.0",
      private: true,
    };
    const packageJsonPath = path.join(resolvedProjectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const { bin, dependencies, devDependencies, scripts } = packageJson;
    const updatedPackageJson = {
      ...projectPackageJson,
      bin,
      scripts,
      dependencies,
      devDependencies,
    };
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(updatedPackageJson, null, 2)
    );
    console.log("Updated package.json with project name and version.");
    console.log();
  } catch (error) {
    console.error("Failed to update package.json:", error);
    process.exit(1);
  }

  // Initialize git repository
  try {
    await executeCmd("git", ["init"], resolvedProjectPath);
    console.log("Initialized a git repository.");
    console.log();
  } catch (error) {
    console.warn("Failed to initialize git repository");
  }

  // Install dependencies
  console.log("Installing template dependencies using npm...");
  try {
    await executeCmd("npm", ["install"], resolvedProjectPath);
    console.log();
  } catch (error) {
    console.error("Failed to install dependencies");
    process.exit(1);
  }

  // Create initial git commit
  try {
    await executeCmd("git", ["add", "-A"], resolvedProjectPath);
    await executeCmd(
      "git",
      ["commit", "-m", "Initial commit from create-mcp-ts"],
      resolvedProjectPath
    );
    console.log("Created git commit.");
    console.log();
  } catch (error) {
    console.warn("Failed to create initial git commit");
  }

  // Print success message with next steps
  printSuccess(projectName, resolvedProjectPath);
}

// Execute the main function and handle any unexpected errors
run().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
