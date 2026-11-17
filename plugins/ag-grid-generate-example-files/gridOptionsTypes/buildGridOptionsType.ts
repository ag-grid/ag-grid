import ts from 'typescript';

import { _GET_ALL_EVENTS } from '../src/executors/generate/generator/_copiedFromCore/eventTypes';
import { _GET_ALL_GRID_OPTIONS } from '../src/executors/generate/generator/_copiedFromCore/propertyKeys';

function getTypes(node: ts.Node) {
    let typesToInclude: string[] = [];
    if (ts.isIdentifier(node)) {
        const typeName = node.getText();
        if (!['HTMLElement', 'Function', 'Partial', 'TData', 'TContext', 'TValue', 'Iterable'].includes(typeName)) {
            typesToInclude.push(typeName);
        }
    }
    node.forEachChild((ct) => {
        // Only recurse down the type branches of the tree so we do not include argument names
        if ((ct as any).type) {
            typesToInclude = [...typesToInclude, ...getTypes((ct as any).type)];
        } else {
            typesToInclude = [...typesToInclude, ...getTypes(ct)];
        }
    });
    return typesToInclude;
}

function getTypeLookupFunc(fileName) {
    const program = ts.createProgram([fileName], {});
    program.getTypeChecker(); // does something important to make types work below

    const optionsFile = program.getSourceFiles().find((f) => f.fileName.endsWith('gridOptions.d.ts'));
    if (optionsFile) {
        const gridOptionsInterface = optionsFile.statements.find(
            (i: ts.Node) => ts.isInterfaceDeclaration(i) && i.name.getText() == 'GridOptions'
        );

        const lookupType = (propName: string) => {
            if (gridOptionsInterface && ts.isInterfaceDeclaration(gridOptionsInterface)) {
                const pop = gridOptionsInterface.members.find(
                    (m) => (ts.isPropertySignature(m) || ts.isMethodSignature(m)) && m.name.getText() == propName
                ) as ts.PropertySignature | ts.MethodSignature | undefined;
                if (pop && ts.isMethodSignature(pop)) {
                    // e.g. `onCellClicked?(event: CellClickedEvent<TData>): void`
                    const parameters = pop.parameters.map((parameter) => parameter.getText()).join(', ');
                    return {
                        typeName: `(${parameters}) => ${pop.type?.getText() ?? 'void'}`,
                        typesToInclude: pop.parameters.flatMap((parameter) =>
                            parameter.type ? getTypes(parameter.type) : []
                        ),
                    };
                }
                if (pop && pop.type) {
                    return { typeName: pop.type.getText(), typesToInclude: getTypes(pop.type) };
                }
            }
            return undefined;
        };

        const fullLookup = {};
        _GET_ALL_GRID_OPTIONS().forEach((prop) => {
            fullLookup[prop] = lookupType(prop as string);
        });
        // Event callbacks, e.g. `onCellClicked`
        _GET_ALL_EVENTS().forEach((eventName) => {
            const callbackName = 'on' + eventName[0].toUpperCase() + eventName.slice(1);
            const typings = lookupType(callbackName);
            if (typings) {
                fullLookup[callbackName] = typings;
            }
        });
        return fullLookup;
    }
    throw new Error('No gridOptions file found');
}

export function getGridOptionsType(): Record<
    string,
    {
        typeName: string;
        typesToInclude: string[];
    }
> {
    return getTypeLookupFunc('./plugins/ag-grid-generate-example-files/gridOptionsTypes/baseGridOptions.ts');
}
