import fs from 'fs';
import path from 'path';

async function removeImport(filePath, importToRemove) {
  const fullPath = path.resolve(filePath);
  try {
    const fileContent = await fs.promises.readFile(fullPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    const newLines = lines.map(line => {
      if (line.trim().startsWith('import') && line.includes(importToRemove)) {
        // Check if the importToRemove is the only import or part of multiple imports
        const match = line.match(/import\s+\{([^}]+)\}\s+from\s+['"](.+)['"]/);
        if (match) {
          const imports = match[1].split(',').map(imp => imp.trim()).filter(imp => imp !== importToRemove);
          if (imports.length > 0) {
            // Replace line with updated imports
            return `import { ${imports.join(', ')} } from '${match[2]}';`;
          } else {
            // Remove entire line if no imports are left
            return '';
          }
        }
      }
      return line;
    }).filter(line => line !== '');

    await fs.promises.writeFile(fullPath, newLines.join('\n'), 'utf-8');
    console.log(`Updated imports in ${fullPath}`);
  } catch (error) {
    console.error(`Error processing ${fullPath}: ${error.message}`);
  }
}

// Example usage:
// removeImport('./src/myFile.js', 'MyClass');
