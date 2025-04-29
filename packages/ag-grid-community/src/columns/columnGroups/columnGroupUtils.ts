import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ColGroupDef } from '../../entities/colDef';

export function createMergedColGroupDef(
    beans: BeanCollection,
    colGroupDef: ColGroupDef | null,
    groupId: string
): ColGroupDef {
    const colGroupDefMerged: ColGroupDef = {} as ColGroupDef;
    const gos = beans.gos;
    Object.assign(colGroupDefMerged, gos.get('defaultColGroupDef'));
    Object.assign(colGroupDefMerged, colGroupDef);
    gos.validateColDef(colGroupDefMerged, groupId);

    return colGroupDefMerged;
}

export function getOriginalColumnTreeDepth(columns: AgColumn[]): number {
    // presence of cols always means level = 0
    let highestLevelItem = 0;
    for (const col of columns) {
        const colParent = col.getOriginalParent();
        if (colParent) {
            highestLevelItem = Math.max(highestLevelItem, colParent.getLevel() + 1); // add 1 to get level for child column
        }
    }
    return highestLevelItem;
}
