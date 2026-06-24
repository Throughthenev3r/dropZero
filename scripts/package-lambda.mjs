import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, ".lambda-package");

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(join(root, "src"), join(outputDir, "src"), { recursive: true });

const sourcePackage = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8")
);

writeFileSync(
  join(outputDir, "package.json"),
  JSON.stringify(
    {
      name: sourcePackage.name,
      version: sourcePackage.version,
      type: "module",
      dependencies: sourcePackage.dependencies,
    },
    null,
    2
  )
);

execSync("npm install --omit=dev", {
  cwd: outputDir,
  stdio: "inherit",
});

console.log(`Lambda package ready: ${outputDir}`);
