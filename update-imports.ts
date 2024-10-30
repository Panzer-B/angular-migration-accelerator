import { Project } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('libs/**/*.{ts,tsx}');

project.getSourceFiles().forEach((sourceFile) => {
  sourceFile.getImportDeclarations().forEach((importDecl) => {
    if (importDecl.getModuleSpecifierValue() === './oldPath') {
      importDecl.setModuleSpecifier('./newPath');
    }
  });
});

project.save();
