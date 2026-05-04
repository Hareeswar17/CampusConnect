import fs from "fs/promises";
import path from "path";

const repoRoot = path.resolve();
const sourceDir = path.join(repoRoot, "frontend", "dist");
const targetDir = path.join(repoRoot, "backend", "frontend", "dist");

const copyDir = async (src, dest) => {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
      continue;
    }

    if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
};

const run = async () => {
  await fs.access(sourceDir);
  await fs.rm(targetDir, { recursive: true, force: true });
  await copyDir(sourceDir, targetDir);
  console.log("Copied frontend dist to backend/frontend/dist");
};

run().catch((error) => {
  console.error("Failed to copy frontend dist:", error.message);
  process.exit(1);
});
