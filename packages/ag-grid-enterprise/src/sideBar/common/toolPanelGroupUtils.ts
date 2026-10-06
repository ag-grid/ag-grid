import type { AgProvidedColumnGroup, BeanCollection } from 'ag-grid-community';

import { getGridColumnGroup } from '../../columns/providedColumnGroupUtils';

/** A layout-only group has no grid group to fire `headerNameChanged`, so each tool panel fires it on its own copy. */
export function createLayoutGroupRenameNotifier(beans: BeanCollection, group: AgProvidedColumnGroup): () => void {
    const { groupId } = group;
    let lastName = beans.colModel.groupHeaderNameOverrides.get(groupId) ?? null;
    return () => {
        const name = beans.colModel.groupHeaderNameOverrides.get(groupId) ?? null;
        if (name === lastName) {
            return;
        }
        lastName = name;
        if (getGridColumnGroup(beans, group) === group) {
            group.dispatchLocalEvent({ type: 'headerNameChanged' });
        }
    };
}
