const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

let tsconfigPaths = {};

function loadTsConfig(basePath) {
    const tsConfigPath = path.join(basePath, 'tsconfig.base.json');
    if (fs.existsSync(tsConfigPath)) {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
        tsconfigPaths = tsConfig.compilerOptions?.paths || {};
    }
}

async function findAngularComponents(dir, allFiles = {}) {
    const files = await readdir(dir);
    for (let file of files) {
        const filePath = path.join(dir, file);
        const stats = await stat(filePath);
        if (stats.isDirectory()) {
            await findAngularComponents(filePath, allFiles);
        } else if (file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const componentSelector = extractSelector(content);
            const moduleName = extractModuleName(content);
            if (componentSelector && moduleName) {
                const resolvedPath = resolveModulePath(filePath);
                allFiles[componentSelector] = { moduleName, path: resolvedPath };
            }
        }
    }
    return allFiles;
}

function resolveModulePath(filePath) {
    const possiblePaths = Object.entries(tsconfigPaths).filter(([key, value]) =>
        value.some(val => val.includes('index.ts')));
    for (let [alias, paths] of possiblePaths) {
        for (let p of paths) {
            const fullP = path.join(path.dirname(filePath), p.replace('*', ''));
            if (fs.existsSync(fullP)) {
                return fullP;
            }
        }
    }
    return filePath;
}

function extractSelector(fileContent) {
    const selectorMatch = fileContent.match(/selector:\s*'([^']+)'/);
    return selectorMatch ? selectorMatch[1] : null;
}

function extractModuleName(fileContent) {
    const moduleMatch = fileContent.match(/@NgModule\({[\s\S]*?}\)\s*export\s+class\s+(\w+)/);
    return moduleMatch ? moduleMatch[1] : null;
}

async function writeComponentsToFile(startPath) {
    try {
        loadTsConfig(startPath);
        const components = await findAngularComponents(startPath);
        fs.writeFileSync('components.json', JSON.stringify(components, null, 2));
        console.log('Components JSON has been written successfully!');
    } catch (error) {
        console.error('Failed to write components JSON:', error);
    }
}

writeComponentsToFile('./path/to/angular/project'); // Change this path to your Angular project's root directory
