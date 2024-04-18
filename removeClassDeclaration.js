const fs = require('fs');
const path = require('path');

// Function to remove Angular module entries from specific arrays in an Angular module file
function cleanAngularModule(filePath, moduleName) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        // Regex to find and remove specific Angular module entries from declarations, exports, or any named array
        const regex = new RegExp(`\\b${moduleName}\\b\s*,?\\s*`, 'g');

        // Process the content of declarations and exports
        const cleanedCode = data.replace(regex, match => {
            // Check if the match is the only or last item in an array (ends with a comma or not)
            return match.trim().endsWith(',') ? '' : '';
        });

        // Output the cleaned code or write it back to the file
        console.log(cleanedCode);
        fs.writeFile(filePath, cleanedCode, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error("Error writing the cleaned code back to the file:", writeErr);
                return;
            }
            console.log("The file has been saved with the Angular module entries cleaned.");
        });
    });
}
