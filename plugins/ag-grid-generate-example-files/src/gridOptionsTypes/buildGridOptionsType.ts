import ts from 'typescript';
import { writeJSONFile } from '../executors-utils';
import { getTypes } from '../executors/generate/generator/transformation-scripts/parser-utils';
import { PropertyKeys } from '../executors/generate/generator/_copiedFromCore/propertyKeys';

function getTypeLookupFunc(fileName) {
    let lookupType = (propName: string) => undefined;
        const program = ts.createProgram([fileName], {});
        program.getTypeChecker(); // does something important to make types work below

        const optionsFile = program.getSourceFiles().find((f) => f.fileName.endsWith('gridOptions.d.ts'));
        if (optionsFile) {
            const gridOptionsInterface = optionsFile.statements.find(
                (i: ts.Node) => ts.isInterfaceDeclaration(i) && i.name.getText() == 'GridOptions'
            ) as ts.InterfaceDeclaration;

            lookupType = (propName: string) => {
                const pop = gridOptionsInterface.members.find(
                    (m) => (ts.isPropertySignature(m) || ts.isMethodSignature(m)) && m.name.getText() == propName
                ) as ts.PropertySignature | ts.MethodSignature;
                if (pop && pop.type) {
                    return { typeName: pop.type.getText(), typesToInclude: getTypes(pop.type) };
                }
                return undefined;
            };

            const fullLookup = {};
            PropertyKeys.ALL_PROPERTIES.forEach((prop) => {
                fullLookup[prop] = lookupType(prop as string);
            });

            writeJSONFile('./src/gridOptionsTypes/_gridOptions_Types.json', fullLookup);
        } else{
            console.error('No gridOptions file found');
        }
}

getTypeLookupFunc('./src/gridOptionsTypes/baseGridOptions.ts');
