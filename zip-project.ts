import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

const zip = new AdmZip();

function addDirectoryToZip(dirPath: string, zipPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (["node_modules", "dist", ".git", "public"].includes(file)) continue;
    
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      addDirectoryToZip(fullPath, path.join(zipPath, file));
    } else {
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

// Add root files and src directory
addDirectoryToZip(process.cwd(), "");

// Manually add public folder contents (excluding the zip itself if it exists)
if (fs.existsSync("public")) {
  const publicFiles = fs.readdirSync("public");
  for (const file of publicFiles) {
    if (file === "source.zip") continue;
    const fullPath = path.join("public", file);
    if (fs.statSync(fullPath).isDirectory()) {
      zip.addLocalFolder(fullPath, "public/" + file);
    } else {
      zip.addLocalFile(fullPath, "public");
    }
  }
}

zip.writeZip("public/source.zip");
console.log("Successfully created public/source.zip");
