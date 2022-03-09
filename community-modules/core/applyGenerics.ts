import { Project, InterfaceDeclaration } from "ts-morph";

console.log('Starting ')

const project = new Project({
    tsConfigFilePath: "./tsconfig.generics.json",
});

const gridOptions = project.getSourceFile('gridOptions.ts')
const imports = gridOptions?.getImportDeclarations();

const sourceFiles = imports?.map(i => i.getModuleSpecifierSourceFile()).filter(sf => !sf?.getFilePath()?.includes('iAgChartOptions'));
sourceFiles?.unshift(gridOptions);

let allInterfaces: InterfaceDeclaration[] = []
sourceFiles?.forEach(sf => {
    allInterfaces = [...allInterfaces, ...sf?.getInterfaces()]
})


console.log(allInterfaces.length)
let updateInterfaces: InterfaceDeclaration[] = []

allInterfaces.forEach(i => {
    const rowNode = i?.getProperty('data')
    if (rowNode && rowNode.getType().getText() == 'any') {
        rowNode?.setType("T");
        if (!i.getTypeParameters().some(t => t.getText() == 'T')) {
            i.addTypeParameter("T")
        }
        updateInterfaces.push(i)
    }
})

const updated: string[] = [];
while (updateInterfaces.length > 0) {
    let ui = updateInterfaces.pop()!;
    if (!updated.includes(ui.getName())) {
        // Find references in other interfaces and update those
        console.log(ui.getName())


        var re = new RegExp(ui.getName() + '(?![\\w])', "g");

        allInterfaces.forEach(i => {
            //    console.log(i.getName())
            const props = i.getMembers();
            props.forEach(p => {
                const toCheck = p.getText();
                // console.log(ui.getName(), toCheck)
                if (toCheck.includes(ui.getName())) {

                    let currStructure = p.getStructure() as any;
                    if (currStructure.type) {
                        currStructure.type = currStructure.type.replace(re, ui.getName() + '<T>').replace('<T><T>', '<T>');
                    }
                    if (currStructure.parameters?.length > 0) {
                        currStructure.parameters = currStructure.parameters.map((p: any) => {
                            p.type = p.type.replace(re, ui.getName() + '<T>').replace('<T><T>', '<T>');
                            return p
                        })
                    }

                    p.set(currStructure)
                    if (!i.getTypeParameters().some(t => t.getText() == 'T')) {
                        i.addTypeParameter("T")
                    }
                    updateInterfaces.push(i)
                }
            })


            const exts = i.getExtends();
            if (exts.length > 0) {
                exts.forEach(ex => {
                    if (ex.getText() == ui.getName()) {
                        if (!i.getTypeParameters().some(t => t.getText() == 'T')) {
                            i.addTypeParameter("T")
                        }
                        const genericExt = ex.getText().replace(re, ui.getName() + '<T>').replace('<T><T>', '<T>');
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