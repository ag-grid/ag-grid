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

const TData = 'TData'
console.log(allInterfaces.length)
let updateInterfaces: InterfaceDeclaration[] = []

allInterfaces.forEach(i => {
    const rowData = i?.getProperty('data')
    //i.getName().endsWith('Params') &&
    if (rowData && rowData.getType().getText() == 'any') {
        rowData?.setType(TData);
        if (!i.getTypeParameters().some(t => t.getText() == TData)) {
            i.addTypeParameter({ name: TData })
        }
        updateInterfaces.push(i)
    }

    const rowNode = i?.getProperty('node')
    //i.getName().endsWith('Params') &&
    if (rowNode) {
        if (rowNode && rowNode.getType().getText().endsWith('RowNode')) {
            rowNode?.setType('RowNode<TData>');
            if (!i.getTypeParameters().some(t => t.getText() == TData)) {
                i.addTypeParameter({ name: TData })
            }
            updateInterfaces.push(i)
        }
    }
})

const updated: string[] = [];
while (updateInterfaces.length > 0) {
    let ui = updateInterfaces.pop()!;
    if (!updated.includes(ui.getName())) {
        // Find references in other interfaces and update those
        console.log(ui.getName())


        var re = new RegExp(ui.getName() + '(?![\\w])', "g");
        const applyGenericType = (type: string, toUpdate: string) => type.replace(re, toUpdate + `<${TData}>`).replace(/<TData><TData>/g, TData);

        allInterfaces.forEach(i => {
            const props = i.getMembers();
            props.forEach(p => {
                const toCheck = p.getText();
                if (toCheck.includes(ui.getName())) {

                    let currStructure = p.getStructure() as any;
                    if (currStructure.type) {
                        currStructure.type = applyGenericType(currStructure.type, ui.getName());
                    }
                    if (currStructure.parameters?.length > 0) {
                        currStructure.parameters = currStructure.parameters.map((p: any) => {
                            p.type = applyGenericType(p.type, ui.getName());
                            return p
                        })
                    }

                    p.set(currStructure)
                    if (!i.getTypeParameters().some(t => t.getText() == TData)) {
                        i.addTypeParameter({ name: TData })
                    }
                    updateInterfaces.push(i)
                }
            })


            const exts = i.getExtends();
            if (exts.length > 0) {
                exts.forEach(ex => {
                    if (ex.getText() == ui.getName()) {
                        if (!i.getTypeParameters().some(t => t.getText() == TData)) {
                            i.addTypeParameter({ name: TData })
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