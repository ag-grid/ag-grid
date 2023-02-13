import { GridOptionsService } from "./gridOptionsService";
import { GridOptions } from "./entities/gridOptions";
import { describe, expect, it, fit, xit } from '@jest/globals';

describe('is performance', () => {

    const gos = new GridOptionsService();
    (gos as any).gridOptions = { isExternalFilterPresent: (p) => p.context } as GridOptions;

    fit('test false', () => {
        let count = 0;
        console.time('use Is');

        while (count < 1_000_000) {
            //const isTree = gos.isTreeData();
            const callback = gos.getCallback('isExternalFilterPresent')!;
            const isFilter = callback({} as any);
            count++;
        }
        console.timeEnd('use Is');
    })

    it('test true', () => {
        let count = 0;
        console.time('pass var');

        while (count < 100000000) {
            //const isTree = gos.isTreeData();
            const isTree = gos.isAccentedSort('accentedSort');
            if (isTree) {
                count++;

            }
        }
        console.timeEnd('pass var');

    })

    it('test sd', () => {
        let count = 0;
        console.time('use method');

        while (count < 100000000) {
            //const isTree = gos.isTreeData();
            const isTree = gos.isAccentedSort1();
            if (isTree) {
                count++;

            }
        }
        console.timeEnd('use method');

    })
});
