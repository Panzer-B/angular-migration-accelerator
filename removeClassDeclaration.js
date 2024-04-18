const fs = require('fs');
const path = require('path');

// Function to remove class declaration from code within an array
function removeClassDeclaration(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        // Regular expression to find class declarations and optional trailing commas
        const regex = /class\s+\w+\s*{[^}]*}\s*,?\s*/g;

        // Replace the class declaration with an empty string
        const cleanedCode = data.replace(regex, '');

        // Output the cleaned code
        console.log(cleanedCode);
    });
}

// Example usage
const filePath = path.join(__dirname, 'yourFile.js'); // Replace 'yourFile.js' with your actual file name
removeClassDeclaration(filePath);
