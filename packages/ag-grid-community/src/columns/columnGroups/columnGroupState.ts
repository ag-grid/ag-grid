import type { BeanCollection } from '../../context/context';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { ColumnEventType } from '../../events';

export const _getColGroupState = (
    beans: BeanCollection
): { groupId: string; open: boolean; headerName: string | null }[] => {
    // Include padding groups (all built groups, not just real ones) so saved state round-trips identically.
    const allGroups = beans.colModel.colsAllGroups;
    const len = allGroups.length;
    const result = new Array<{ groupId: string; open: boolean; headerName: string | null }>(len);
    for (let i = 0; i < len; ++i) {
        const group = allGroups[i];
        result[i] = { groupId: group.groupId, open: group.expanded, headerName: group.headerNameOverride };
    }
    return result;
};

export const _setColGroupOpen = (
    beans: BeanCollection,
    key: AgProvidedColumnGroup | string | null | undefined,
    newValue: boolean,
    source: ColumnEventType
): void => {
    const groupId = isProvidedColumnGroup(key) ? key.groupId : key || '';
    _setColGroupState(beans, [{ groupId, open: newValue }], source);
};

export const _setColGroupState = (
    beans: BeanCollection,
    stateItems: { groupId: string; open: boolean | undefined; headerName?: string | null }[],
    source: ColumnEventType
): void => {
    const { colAnimation, visibleCols, eventSvc, colModel } = beans;
    const groupsById = colModel.colsGroupsById;
    const stateLen = stateItems.length;
    if (!groupsById.size || !stateLen) {
        return;
    }

    colAnimation?.start();

    let impactedGroups: AgProvidedColumnGroup[] | null = null;
    let headerNameChanged = false;
    for (let i = 0; i < stateLen; ++i) {
        const stateItem = stateItems[i];
        const group = groupsById.get(stateItem.groupId);
        if (!group) {
            continue;
        }
        if (group.setExpanded(stateItem.open)) {
            impactedGroups ??= [];
            impactedGroups.push(group);
        }
        if ('headerName' in stateItem && group.setHeaderNameOverride(stateItem.headerName ?? null)) {
            headerNameChanged = true;
        }
    }

    if (headerNameChanged) {
        // Grid-level event so the state service can refresh the cached group header-name state.
        eventSvc.dispatchEvent({ type: 'columnHeaderNameChanged' });
    }

    if (impactedGroups) {
        visibleCols.refresh(source, true);
        eventSvc.dispatchEvent({
            type: 'columnGroupOpened',
            columnGroup: impactedGroups.length === 1 ? impactedGroups[0] : undefined,
            columnGroups: impactedGroups,
        });
    }

    colAnimation?.finish();
};

export const _resetColGroupState = (beans: BeanCollection, source: ColumnEventType): void => {
    const stateItems: { groupId: string; open: boolean | undefined }[] = [];
    beans.colModel.colDefGroupsById.forEach((group) => {
        stateItems.push({ groupId: group.groupId, open: group.colGroupDef?.openByDefault });
    });
    _setColGroupState(beans, stateItems, source);
};
