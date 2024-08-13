import type { GridApi, IRowNode } from '@ag-grid-community/core';
import util from 'util';

export const isGridApi = (node: unknown): node is GridApi =>
    typeof node === 'object' && node !== null && typeof (node as GridApi).setGridOption === 'function';

export const getAllRows = (api: GridApi | null | undefined) => {
    const rows: IRowNode<any>[] = [];
    api?.forEachNode((node) => rows.push(node));
    return rows;
};

export const printDataSnapshot = (data: any, pretty = false) => {
    if (typeof data === 'string') {
        console.log('\nsnapshot:\n' + JSON.stringify(data) + '\n');
    }
    console.log(
        '\nsnapshot:\n' +
            util.inspect(data, {
                colors: false,
                depth: 0xfffff,
                breakLength: pretty ? 120 : 0xfffff,
                maxArrayLength: 0xfffff,
                compact: true,
                getters: false,
                maxStringLength: 0xfffff,
                showHidden: false,
                showProxy: false,
                sorted: false,
                customInspect: false,
                numericSeparator: false,
            }) +
            '\n'
    );
};
