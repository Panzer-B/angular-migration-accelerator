const fs = require('fs');

function removeImport(filePath, importToRemove) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Regular expression to find any import statement that contains the importToRemove
        const importRegex = /import\s+{[^}]*}\s+from\s+['"][^'"]+['"];?/g;
        let updatedData = data.replace(importRegex, (match) => {
            // Check if the importToRemove is part of the current import statement
            if (new RegExp(`\\b${importToRemove}\\b`).test(match)) {
                // Remove the specified import from the import list
                let newImportList = match.replace(new RegExp(`\\b${importToRemove}\\b,?\\s*`, 'g'), '');
                // Clean up any residual commas or spaces
                newImportList = newImportList.replace(/,\s*}/, '}').replace(/{,\s*/, '{');
                // Remove the import statement if it becomes empty
                if (newImportList.includes('import { }')) {
                    return '';
                }
                return newImportList;
            }
            return match;
        });

        // Write the updated content back to the file
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Import removed successfully.');
            }
        });
    });
}

// Example usage
removeImport('path/to/your/file.ts', 'ClassName');
