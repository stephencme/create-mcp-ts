import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

describe("create-mcp-ts", () => {
  const testProjectDir = "./.mcp-ts/test-mcp-server";
  const testProjectName = path.basename(testProjectDir);
  const templatePath = "../mcp-ts-template-default";

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(testProjectDir)) {
      fs.removeSync(testProjectDir);
    }
  });

  it("should create a new MCP server project with local template", () => {
    // Run the command
    const command = `node dist/index.js ${testProjectDir} --template=file:${templatePath}`;
    execSync(command, { stdio: "inherit" });

    // Verify project structure
    expect(fs.existsSync(testProjectDir)).toBe(true);
    expect(fs.existsSync(path.join(testProjectDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(testProjectDir, "src"))).toBe(true);
    expect(fs.existsSync(path.join(testProjectDir, ".git"))).toBe(true);

    // Verify package.json content
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(testProjectDir, "package.json"), "utf-8")
    );
    expect(packageJson.name).toBe(testProjectName);
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts.dev).toBeDefined();
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.setup).toBeDefined();
    expect(packageJson.scripts.eject).toBeDefined();
  });

  it("should eject the project correctly", () => {
    // 1. Initialize the project first
    const initCommand = `node dist/index.js ${testProjectDir} --template=file:${templatePath}`;
    execSync(initCommand, { stdio: "ignore" }); // ignore stdio for less noisy tests

    // 2. Run the eject command within the test project directory
    // Need to install dependencies first so mcp-scripts is available
    execSync("npm install", { cwd: testProjectDir, stdio: "ignore" });
    // Run eject using the installed script
    const ejectCommand = "npm run eject"; // This assumes eject is defined in the template's package.json
    execSync(ejectCommand, { cwd: testProjectDir, stdio: "ignore" });

    // 3. Verify package.json changes
    const packageJsonPath = path.join(testProjectDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // Check scripts
    expect(packageJson.scripts.dev).toBe("tsup src/index.ts --dts --watch");
    expect(packageJson.scripts.build).toBe("tsup src/index.ts --dts --clean");
    // Check setup script path (relative)
    expect(packageJson.scripts.setup).toMatch(
      /^node mcp-scripts[\\/]setup\.js$/
    ); // Match both / and \\ for cross-platform
    expect(packageJson.scripts.eject).toBeUndefined(); // Eject script should remove itself if defined

    // Check dependencies
    expect(packageJson.dependencies?.["mcp-scripts"]).toBeUndefined();
    expect(packageJson.devDependencies?.["mcp-scripts"]).toBeUndefined();
    expect(packageJson.devDependencies?.tsup).toBeDefined(); // tsup should be added

    // 4. Verify copied files
    expect(
      fs.existsSync(path.join(testProjectDir, "mcp-scripts/setup.js"))
    ).toBe(true);

    // 5. Verify mcp-scripts is removed from node_modules (optional, but good check)
    // This check assumes npm prune or similar isn't run automatically,
    // but the dependency removal in package.json is the main goal.
    // expect(fs.existsSync(path.join(testProjectDir, 'node_modules/mcp-scripts'))).toBe(false); // This might fail depending on npm/yarn behavior after script execution
  });
});
