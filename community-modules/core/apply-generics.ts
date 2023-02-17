import { Project, InterfaceDeclaration } from "ts-morph";

console.log('Starting ')

const project = new Project({
    tsConfigFilePath: "./tsconfig.generics.json",
});

const gridOptions = project.getSourceFile('gridOptions.ts')
const colDef = project.getSourceFile('colDef.ts')
const imports = [...gridOptions?.getImportDeclarations(), ...colDef?.getImportDeclarations()];

const sourceFiles = imports?.map(i => i.getModuleSpecifierSourceFile()).filter(sf => !sf?.getFilePath()?.includes('iAgChartOptions'));
sourceFiles?.unshift(gridOptions);

let allInterfaces: InterfaceDeclaration[] = []
sourceFiles?.forEach(sf => {
    allInterfaces = [...allInterfaces, ...sf?.getInterfaces()]
})

const TGeneric = 'TContext'
console.log(allInterfaces.length)
let updateInterfaces: InterfaceDeclaration[] = []

allInterfaces.forEach(i => {
    const genericProp = i?.getProperty('context')
    //i.getName().endsWith('Params') &&
    if (genericProp && genericProp.getType().getText() == 'any') {
        genericProp?.setType(TGeneric);
        if (!i.getTypeParameters().some(t => t.getText() == TGeneric)) {
            i.addTypeParameter({ name: TGeneric })
        }
        updateInterfaces.push(i)
    }

    /*  const rowNode = i?.getProperty('node')
     //i.getName().endsWith('Params') &&
     if (rowNode) {
         if (rowNode && rowNode.getType().getText().endsWith('RowNode')) {
             rowNode?.setType('RowNode<TData>');
             if (!i.getTypeParameters().some(t => t.getText() == TGeneric)) {
                 i.addTypeParameter({ name: TGeneric })
             }
             updateInterfaces.push(i)
         }
     } */
})

const updated: string[] = [];
while (updateInterfaces.length > 0) {
    let ui = updateInterfaces.pop()!;
    if (!updated.includes(ui.getName())) {
        // Find references in other interfaces and update those
        console.log(ui.getName())


        var re = new RegExp(ui.getName() + '(?![\\w])', "g");
        const applyGenericType = (tt: string, toUpdate: string) => {
            console.log('type', tt, toUpdate)
            toUpdate = tt;
            if (tt.includes('TContext') || tt.includes('[]') || tt.includes('=>')) {
                // Nothing to do
            } else if (tt.includes('<TData>')) {
                tt = toUpdate.replace('<TData>', '<TData, TContext>')
            } else if (tt.includes('<TData = any>')) {
                tt = toUpdate.replace('<TData = any>', '<TData = any, TContext = any>')
            } else if (tt.includes('<TData, TValue>')) {
                tt = toUpdate.replace('<TData, TValue>', '<TData, TValue, TContext>')
            }
            else if (tt.includes('<TData = any, TValue = any>')) {
                tt = toUpdate.replace('<TData = any, TValue = any>', '<TData = any, TValue = any, TContext = any>')
            } else if (tt.includes('<any>')) {
                tt = toUpdate.replace('<any>', '<any, TContext>')
            }
            else if (!tt.includes('<')) {
                tt = toUpdate + '<TContext>'
            }
            return tt;
        }

        /*         type.replace(re, toUpdate + `<${TGeneric}>`)
                    .replace(/<TContext><TContext>/, TGeneric)
                    .replace(/<TContext><TData>/, '<TData, TContext>')
                    .replace(/<TContext><any>/, '<any, TContext>') */

        allInterfaces.forEach(i => {
            const props = i.getMembers();
            props.forEach(p => {
                const toCheck = p.getText();
                if (toCheck.includes(ui.getName())) {

                    let currStructure = p.getStructure() as any;
                    if (currStructure.type) {
                        currStructure.type = applyGenericType(currStructure.type, currStructure.type)
                    }
                    if (currStructure.parameters?.length > 0) {
                        currStructure.parameters = currStructure.parameters.map((p: any) => {
                            p.type = applyGenericType(p.type, ui.getName());
                            return p
                        })
                    }

                    p.set(currStructure)
                    if (!i.getTypeParameters().some(t => t.getText().includes(TGeneric))) {
                        i.addTypeParameter({ name: TGeneric + ' = any' })
                    }
                    updateInterfaces.push(i)
                }
            })


            const exts = i.getExtends();
            if (exts.length > 0) {
                exts.forEach(ex => {
                    if (ex.getText().split('<')[0] == ui.getName()) {
                        if (!i.getTypeParameters().some(t => t.getText().includes(TGeneric))) {
                            i.addTypeParameter({ name: TGeneric + ' = any' })
                        }
                        const genericExt = applyGenericType(ex.getText(), ui.getName());

                        i.removeExtends(ex)
                        i.addExtends(genericExt)
                        updateInterfaces.push(i)
                    }
                })
            }
        })
    }
    updated.push(ui.getName())
}

project.saveSync();