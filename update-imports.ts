import { Tree, formatFiles, joinPathFragments } from '@nx/devkit';
import { Project, ImportDeclarationStructure, StructureKind } from 'ts-morph';

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

  // Add all TypeScript files in the workspace
  tree.visit((filePath) => {
    if (filePath.endsWith('.ts')) {
      const fullPath = joinPathFragments(tree.root, filePath);
      project.addSourceFileAtPath(fullPath);
    }
  });

  // Iterate through each source file to update imports
  project.getSourceFiles().forEach((sourceFile) => {
    let hasModifications = false;

    sourceFile.getImportDeclarations().forEach((importDecl) => {
      const namedImports = importDecl.getNamedImports();
      const importPath = importDecl.getModuleSpecifierValue();

      // Find if the specific `objectName` exists in this import declaration
      const specificImport = namedImports.find((namedImport) => namedImport.getName() === objectName);

      if (specificImport) {
        // Update only the specific import path if `objectName` is found
        const updatedImports = namedImports
          .map((namedImport) => {
            if (namedImport.getName() === objectName) {
              hasModifications = true;
              return { kind: StructureKind.ImportSpecifier, name: objectName };
            }
            return { kind: StructureKind.ImportSpecifier, name: namedImport.getName() };
          })
          .filter((importSpec) => importSpec.name !== '');

        // Update the import declaration with the new path and cleaned-up imports
        importDecl.replaceWithText(
          `import { ${updatedImports.map((imp) => imp.name).join(', ')} } from '${updatedImports.some((imp) => imp.name === objectName) ? newPath : importPath}';`
        );
      }
    });

    if (hasModifications) {
      sourceFile.saveSync();
    }
  });

  await formatFiles(tree);
}
