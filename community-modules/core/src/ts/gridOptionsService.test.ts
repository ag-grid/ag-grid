import { GridOptionsService } from "./gridOptionsService";


fdescribe('is performance', () => {

    const gos = new GridOptionsService();
    (gos as any).gridOptions = { treeData: true, accentedSort: 'true' };

    it('test false', () => {
        let count = 0;
        console.time('use Is');

        while (count < 100000000) {
            //const isTree = gos.isTreeData();
            const isTree = gos.is('accentedSort');
            if (isTree) {
                count++;

            }
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
