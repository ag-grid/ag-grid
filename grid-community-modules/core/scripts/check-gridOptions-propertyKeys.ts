// @ts-nocheck
const fs = require('fs');
const ts = require('typescript');
import { ComponentUtil } from '../src/ts/components/componentUtil'

function getGridOptionProps(node) {
    let gridOptionsNode = undefined;
    ts.forEachChild(node, n => {
        if (n?.name?.escapedText == 'GridOptions') {
            gridOptionsNode = n;
        }
    });

    let gridOpsMembers: string[] = [];
    ts.forEachChild(gridOptionsNode, (n: any) => {
        gridOpsMembers.push(n?.name?.escapedText)
    });
    return gridOpsMembers;
}

function parseFile(sourceFile: any) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

function checkGridOptionPropertyKeys() {
    const gridOpsFile = "../core/src/ts/entities/gridOptions.ts";
    const srcFile = parseFile(gridOpsFile);
    const gridOpsMembers = getGridOptionProps(srcFile, 'GridOptions');


    const ignored = ['api', 'columnApi', 'TData']
    //Check our PropertyKeys is accurate via ComponentUtils
    const keysToCheck = [...ComponentUtil.ALL_PROPERTIES, ...ComponentUtil.EVENTS, ...ComponentUtil.EVENT_CALLBACKS, ...ignored];
    const missingPropertyKeys: string[] = [];
    gridOpsMembers.forEach(k => {
        if (k && !keysToCheck.includes(k)) {
            missingPropertyKeys.push(k)
        }
    })

    if (missingPropertyKeys.length > 0) {
        console.error('PropertyKeys is missing the following GridOption properties:', missingPropertyKeys.join(', '))
        return 1;
    }
    return 0;
}

const result = checkGridOptionPropertyKeys()
process.exit(result)