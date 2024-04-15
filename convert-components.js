const fs = require('fs');
const { parseTemplate } = require('@angular/compiler');

// Path to your Angular component and modules.json
const componentFilePath = 'path/to/your/component.ts';
const modulesJsonPath = 'modules.json';

// Helper function to extract Angular modules used in the component
function extractModulesFromComponent(content) {
  const matches = content.match(/(?<=import\s\{[^}]*\}\sfrom\s'[^']*';)/g);
  return matches ? matches.map(line => line.split('{')[1].split('}')[0].trim()) : [];
}

// Modify the component to be standalone and include necessary imports
function convertToStandaloneComponent(componentContent, modules) {
  // Mark component as standalone
  componentContent = componentContent.replace('@Component({', '@Component({\n  standalone: true,');
  
  // Read modules.json to find paths for imports
  const moduleMappings = JSON.parse(fs.readFileSync(modulesJsonPath, 'utf8'));
  const importStatements = modules.map(module => {
    const foundModule = moduleMappings.find(m => m.module === module);
    return foundModule ? `import { ${module} } from '${foundModule.path}';\n` : '';
  }).join('');

  // Add imports to the top of the file
  componentContent = importStatements + componentContent;

  return componentContent;
}

// Main function to process the component
function processComponent() {
  try {
    const componentContent = fs.readFileSync(componentFilePath, 'utf8');
    const modules = extractModulesFromComponent(componentContent);
    const updatedComponent = convertToStandaloneComponent(componentContent, modules);
    fs.writeFileSync(componentFilePath, updatedComponent, 'utf8');
    console.log('Component has been successfully converted to standalone.');
  } catch (error) {
    console.error('Error processing component:', error);
  }
}

// Run the script
processComponent();
