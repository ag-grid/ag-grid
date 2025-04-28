import type { BeanCollection } from '../../context/context';
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
