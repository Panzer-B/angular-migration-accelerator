const fs = require('fs').promises;
const glob = require('glob-promise');

// New configuration structure
const importConfig = [
  {
    itemName: 'priceDirective',
    currentModule: '@core',
    newModule: '@directives'
  },
  {
    itemName: 'utilFunction',
    currentModule: '@utils',
    newModule: '@shared/utilities'
  },
  // Add more items as needed
];

async function processFiles(filePattern) {
  const files = await glob(filePattern);
  const tasks = files.map(file => processFile(file));
  const results = await Promise.all(tasks);
  results.forEach(result => {
    if (result) console.log(result);
  });
}

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let updatedContent = content;

  // Apply changes based on the new configuration
  importConfig.forEach(({ itemName, currentModule, newModule }) => {
    const regex = new RegExp(`import {([^}]*)${itemName}([^}]*)} from '${currentModule}'`, 'g');
    updatedContent = updatedContent.replace(regex, (match, before, after) => {
      const otherImports = `${before}${after}`.trim().replace(/^,|,$/g, '');
      const newImportLine = otherImports.length > 0
        ? `import {${otherImports}} from '${currentModule}';\nimport { ${itemName} } from '${newModule}'`
        : `import { ${itemName} } from '${newModule}'`;
      return newImportLine;
    });
  });

  if (content !== updatedContent) {
    await fs.writeFile(filePath, updatedContent, 'utf8');
    return `Updated imports in ${filePath}`;
  }
  return null;
}

processFiles('/path/to/your/project/**/*.ts').catch(console.error);
