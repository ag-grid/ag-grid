import type { BeanCollection } from '../../context/context';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { ColumnEventType } from '../../events';
import { _dispatchGroupHeaderNameChangedEvent } from '../columnEventUtils';

interface ColGroupState {
    groupId: string;
    open: boolean;
    headerName?: string | null;
}

export const _getColGroupState = (beans: BeanCollection): ColGroupState[] => {
    // Include padding groups (all built groups, not just real ones) so saved state round-trips identically.
    const allGroups = beans.colModel.colsAllGroups;
    const len = allGroups.length;
    const overrides = beans.colModel.groupHeaderNameOverrides;
    const result = new Array<ColGroupState>(len);
    for (let i = 0; i < len; ++i) {
        const group = allGroups[i];
        result[i] = { groupId: group.groupId, open: group.expanded, headerName: overrides.get(group.groupId) ?? null };
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

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Sets (or with `null`, clears) a group's header name override and fires `headerNameChanged` on the grid's group.
 * Callers dispatch the grid-level `columnHeaderNameChanged` event, so a batch of renames can share one.
 * Returns whether the name changed.
 */
export const _setColGroupHeaderNameOverride = (
    beans: BeanCollection,
    groupId: string,
    headerName: string | null
): boolean => {
    const { colModel } = beans;
    const overrides = colModel.groupHeaderNameOverrides;
    if ((overrides.get(groupId) ?? null) === headerName) {
        return false;
    }
    if (headerName == null) {
        overrides.delete(groupId);
    } else {
        overrides.set(groupId, headerName);
    }
    colModel.getColGroup(groupId)?.dispatchGroupEvent('headerNameChanged');
    return true;
};

export const _setColGroupState = (
    beans: BeanCollection,
    stateItems: ColGroupState[],
    source: ColumnEventType
): void => {
    const { colAnimation, visibleCols, eventSvc, colModel } = beans;
    const groupsById = colModel.colsGroupsById;
    const stateLen = stateItems.length;
    if (!groupsById.size || !stateLen) {
        return;
    }

    // one update, so a group is told once every group holds its state and the columns are laid out
    colModel.beginColUpdate();
    try {
        colAnimation?.start();
        let impactedGroups: AgProvidedColumnGroup[] | null = null;
        let renamedGroups: AgProvidedColumnGroup[] | null = null;
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
            if (
                'headerName' in stateItem &&
                _setColGroupHeaderNameOverride(beans, group.groupId, stateItem.headerName ?? null)
            ) {
                renamedGroups ??= [];
                renamedGroups.push(group);
            }
        }

        if (renamedGroups) {
            // Grid-level event so the state service can refresh the cached group header-name state.
            _dispatchGroupHeaderNameChangedEvent(
                eventSvc,
                renamedGroups.length === 1 ? renamedGroups[0] : null,
                source
            );
        }

        if (impactedGroups) {
            visibleCols.refresh(source, true);
            eventSvc.dispatchEvent({
                type: 'columnGroupOpened',
                columnGroup: impactedGroups.length === 1 ? impactedGroups[0] : undefined,
                columnGroups: impactedGroups,
            });
        }
    } finally {
        colAnimation?.finish();
        colModel.endColUpdate();
    }
};

export const _resetColGroupState = (beans: BeanCollection, source: ColumnEventType): void => {
    const stateItems: ColGroupState[] = [];
    beans.colModel.colDefGroupsById.forEach((group) => {
        stateItems.push({ groupId: group.groupId, open: !!group.colGroupDef?.openByDefault, headerName: null });
    });
    _setColGroupState(beans, stateItems, source);
};
