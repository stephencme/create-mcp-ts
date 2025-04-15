const fs = require("fs");
const glob = require("glob");

try {
  // Read mcp-scripts package.json to get the version
  const mcpScriptsPackage = JSON.parse(
    fs.readFileSync("packages/mcp-scripts/package.json", "utf8")
  );
  const version = mcpScriptsPackage.version;

  console.log(`Detected mcp-scripts version: ${version}`);

  // Find all template package.json files
  const templatePackageFiles = glob.sync(
    "packages/mcpi-template-*/package.json"
  );

  // Update mcp-scripts dependency in each template package
  templatePackageFiles.forEach((packagePath) => {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    let updated = false;

    // Check and update in dependencies
    if (packageJson.dependencies?.["mcp-scripts"]) {
      packageJson.dependencies["mcp-scripts"] = `^${version}`;
      updated = true;
    }

    // Check and update in devDependencies
    if (packageJson.devDependencies?.["mcp-scripts"]) {
      packageJson.devDependencies["mcp-scripts"] = `^${version}`;
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(
        packagePath,
        JSON.stringify(packageJson, null, 2) + "\n"
      );
      console.log(
        `Updated mcp-scripts dependency to ${version} in ${packagePath}`
      );
    }
  });
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
