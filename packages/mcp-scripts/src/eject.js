#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Ejecting from mcp-scripts...");

const projectRoot = process.cwd();
const projectPackageJsonPath = path.join(projectRoot, "package.json");
// Use path.resolve to ensure the path is absolute, especially when run via npx
const scriptsPackageJsonPath = path.resolve(__dirname, "../package.json");
const setupScriptSourcePath = path.resolve(__dirname, "setup.js");
const projectScriptsDir = path.join(projectRoot, "mcp-scripts"); // Changed target directory
const projectSetupScriptPath = path.join(projectScriptsDir, "setup.js");

try {
  // --- Pre-flight checks ---
  console.log("Performing pre-flight checks...");

  // Check project package.json exists
  if (!fs.existsSync(projectPackageJsonPath)) {
    throw new Error(
      `Could not find package.json in project root: ${projectRoot}`
    );
  }
  const projectPackageJson = JSON.parse(
    fs.readFileSync(projectPackageJsonPath, "utf8")
  );
  const projectScripts = projectPackageJson.scripts || {};

  // Check if default scripts were modified
  const expectedScripts = {
    dev: "mcp-scripts dev",
    build: "mcp-scripts build",
    setup: "mcp-scripts setup",
  };
  for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
    if (
      projectScripts[scriptName] &&
      projectScripts[scriptName] !== expectedCommand
    ) {
      throw new Error(
        `Script '${scriptName}' in your package.json has been modified from the default ('${expectedCommand}'). Ejection cannot proceed automatically. Please revert the script or eject manually.`
      );
    }
  }

  // Check for file conflicts
  if (fs.existsSync(projectSetupScriptPath)) {
    throw new Error(
      `Conflict: File already exists at ${projectSetupScriptPath}. Ejection cannot proceed.`
    );
  }
  // Check if the target directory exists *and* is not a directory (edge case)
  if (
    fs.existsSync(projectScriptsDir) &&
    !fs.lstatSync(projectScriptsDir).isDirectory()
  ) {
    throw new Error(
      `Conflict: A file exists at ${projectScriptsDir}, which is needed for the mcp-scripts directory. Ejection cannot proceed.`
    );
  }

  console.log("Pre-flight checks passed.");

  // --- Read mcp-scripts' package.json to find dependencies ---
  let actualScriptsPackageJsonPath = scriptsPackageJsonPath;
  if (!fs.existsSync(actualScriptsPackageJsonPath)) {
    // Fallback if running directly from src or __dirname is unexpected
    const altScriptsPackageJsonPath = path.join(
      projectRoot,
      "node_modules/mcp-scripts/package.json"
    );
    if (!fs.existsSync(altScriptsPackageJsonPath)) {
      throw new Error(
        "Could not find mcp-scripts package.json. Ensure it's installed."
      );
    }
    actualScriptsPackageJsonPath = altScriptsPackageJsonPath; // Adjust path if found in node_modules
  }
  const scriptsPackageJson = JSON.parse(
    fs.readFileSync(actualScriptsPackageJsonPath, "utf8")
  );
  const scriptsDependencies = scriptsPackageJson.dependencies || {};
  const tsupVersion = scriptsDependencies.tsup;
  if (!tsupVersion) {
    console.warn(
      "Warning: Could not find 'tsup' in mcp-scripts dependencies. Build scripts might not work."
    );
  }
  console.log("Read mcp-scripts package.json.");

  // --- Start Ejection Process (Irreversible Changes Below) ---
  console.log("Starting irreversible ejection process...");

  // --- 3. Copy setup.js ---
  if (!fs.existsSync(projectScriptsDir)) {
    fs.mkdirSync(projectScriptsDir);
    console.log(`Created directory: ${projectScriptsDir}`);
  }
  // Adjust setup script source path if running directly from src
  let actualSetupSourcePath = setupScriptSourcePath;
  if (!fs.existsSync(actualSetupSourcePath)) {
    actualSetupSourcePath = path.resolve(
      projectRoot,
      "node_modules/mcp-scripts/dist/setup.js"
    );
    if (!fs.existsSync(actualSetupSourcePath)) {
      // Try one more level up if dist isn't directly in node_modules/mcp-scripts
      actualSetupSourcePath = path.resolve(
        projectRoot,
        "node_modules/mcp-scripts/src/setup.js"
      );
      if (!fs.existsSync(actualSetupSourcePath)) {
        throw new Error(`Could not find setup.js script to copy.`);
      }
    }
  }

  fs.copyFileSync(actualSetupSourcePath, projectSetupScriptPath);
  console.log(`Copied setup.js to ${projectSetupScriptPath}`);

  // --- 4. Update scripts in project's package.json ---
  // Re-read package.json just in case, though checks should prevent issues
  const freshProjectPackageJson = JSON.parse(
    fs.readFileSync(projectPackageJsonPath, "utf8")
  );
  const freshProjectScripts = freshProjectPackageJson.scripts || {};
  let scriptsUpdated = false;

  if (freshProjectScripts.dev === "mcp-scripts dev") {
    freshProjectScripts.dev = "tsup src/index.ts --format esm --dts --watch";
    scriptsUpdated = true;
  }
  if (freshProjectScripts.build === "mcp-scripts build") {
    freshProjectScripts.build = "tsup src/index.ts --format esm --dts --clean";
    scriptsUpdated = true;
  }
  if (freshProjectScripts.setup === "mcp-scripts setup") {
    // Use relative path for cross-platform compatibility
    freshProjectScripts.setup = `node ${path.relative(
      projectRoot,
      projectSetupScriptPath
    )}`;
    scriptsUpdated = true;
  }
  if (freshProjectScripts.eject === "mcp-scripts eject") {
    delete freshProjectScripts.eject;
    scriptsUpdated = true;
  }

  if (scriptsUpdated) {
    freshProjectPackageJson.scripts = freshProjectScripts;
    console.log("Updated scripts in project package.json object.");
  } else {
    // This case should ideally not be reached due to pre-flight checks
    console.log("No scripts needed updating in project package.json.");
  }

  // --- 5. Add tsup as devDependency ---
  if (tsupVersion) {
    if (!freshProjectPackageJson.devDependencies) {
      freshProjectPackageJson.devDependencies = {};
    }
    if (!freshProjectPackageJson.devDependencies.tsup) {
      freshProjectPackageJson.devDependencies.tsup = tsupVersion;
      console.log(`Added tsup@${tsupVersion} to project devDependencies.`);
    } else {
      console.log(`tsup already exists in project devDependencies.`);
    }
  }

  // --- 6. Remove mcp-scripts dependency ---
  let removed = false;
  if (
    freshProjectPackageJson.dependencies &&
    freshProjectPackageJson.dependencies["mcp-scripts"]
  ) {
    delete freshProjectPackageJson.dependencies["mcp-scripts"];
    removed = true;
  }
  if (
    freshProjectPackageJson.devDependencies &&
    freshProjectPackageJson.devDependencies["mcp-scripts"]
  ) {
    delete freshProjectPackageJson.devDependencies["mcp-scripts"];
    removed = true;
  }
  if (removed) {
    console.log("Removed mcp-scripts from project dependencies object.");
  } else {
    // This case should also ideally not be reached
    console.log("mcp-scripts not found in project dependencies.");
  }

  // --- 7. Write updated package.json ---
  fs.writeFileSync(
    projectPackageJsonPath,
    JSON.stringify(freshProjectPackageJson, null, 2) + "\n" // Add trailing newline
  );
  console.log(`Successfully updated ${projectPackageJsonPath}`);

  // --- 8. Instruct user ---
  console.log(
    "\nEjection successful! \nPlease run 'npm install' (or 'yarn install' or 'pnpm install') to update your dependencies."
  );
  console.log(
    "Your build, dev, and setup scripts have been updated to run directly."
  );
  console.log(
    `Configuration files like setup.js have been copied to the '${path.basename(
      projectScriptsDir
    )}' directory.`
  );
  console.log(
    "You are now responsible for maintaining these configurations and dependencies."
  );
} catch (error) {
  console.error("\nEjection failed:", error.message);
  process.exit(1);
}
