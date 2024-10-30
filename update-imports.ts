import { Tree, formatFiles, joinPathFragments } from '@nx/devkit';
import { Project } from 'ts-morph';

interface UpdateImportsGeneratorSchema {
  objectName: string;
  newPath: string;
}

export default async function updateImportsGenerator(
  tree: Tree,
  schema: UpdateImportsGeneratorSchema
) {
  const { objectName, newPath } = schema;
  const project = new Project();

  // Recursively add all TypeScript files in the workspace
  function addTsFilesRecursively(dir: string) {
    tree.children(dir).forEach((fileOrDir) => {
      const fullPath = joinPathFragments(dir, fileOrDir);
      if (tree.isFile(fullPath) && fullPath.endsWith('.ts')) {
        console.log(`Processing file: ${fullPath}`);
        project.addSourceFileAtPath(fullPath);
      } else if (!tree.isFile(fullPath)) {
        addTsFilesRecursively(fullPath);
      }
    });
  }

  addTsFilesRecursively(tree.root);

  // Iterate through each source file to update imports
  project.getSourceFiles().forEach((sourceFile) => {
    let hasModifications = false;

    sourceFile.getImportDeclarations().forEach((importDecl) => {
      const namedImports = importDecl.getNamedImports();
      const importPath = importDecl.getModuleSpecifierValue();

      // Check for specific import
      const specificImport = namedImports.find((namedImport) => namedImport.getName() === objectName);

      if (specificImport) {
        hasModifications = true;
        console.log(`Found "${objectName}" in ${sourceFile.getFilePath()}. Updating path to "${newPath}".`);

        // Filter out objectName to create a clean import statement
        const remainingImports = namedImports
          .filter((namedImport) => namedImport.getName() !== objectName)
          .map((namedImport) => namedImport.getName())
          .join(', ');

        // Update the import declaration
        const updatedImportText = remainingImports
          ? `import { ${remainingImports}, ${objectName} } from '${newPath}';`
          : `import { ${objectName} } from '${newPath}';`;

        importDecl.replaceWithText(updatedImportText);
      }
    });

    // Save file if it was modified
    if (hasModifications) {
      sourceFile.saveSync();
    }
  });

  await formatFiles(tree);
}
