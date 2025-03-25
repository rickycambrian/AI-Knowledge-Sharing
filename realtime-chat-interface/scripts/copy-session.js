import fs from 'fs';
import path from 'path';

// Source path
const sourcePath = path.join(process.cwd(), '../../session-one/session-one.Rmd');

// Destination path
const destDir = path.join(process.cwd(), '../utils');
const destPath = path.join(destDir, 'session-one.Rmd');

// Create directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found at: ${sourcePath}`);
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Successfully copied session-one.Rmd to: ${destPath}`);
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}