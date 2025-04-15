import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

describe("mcp-init", () => {
  const testProjectDir = "./.mcpi/test-mcp-server";
  const testProjectName = path.basename(testProjectDir);
  const templatePath = "../mcpi-template-default";

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
});
