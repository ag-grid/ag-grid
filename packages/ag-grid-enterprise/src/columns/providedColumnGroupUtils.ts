import type { AgProvidedColumnGroup, BeanCollection, HeaderLocation } from 'ag-grid-community';

/** Tool panels build their own copy of each group; user callbacks get the grid's group where one exists. */
export function getGridColumnGroup(beans: BeanCollection, group: AgProvidedColumnGroup): AgProvidedColumnGroup {
    return beans.colModel.colDefGroupsById.get(group.groupId) ?? group;
}

/**
 * Names come from the given group's definition, which a tool panel's custom layout may set, while
 * `headerValueGetter` gets the grid's group.
 */
export function getProvidedGroupDisplayName(
    beans: BeanCollection,
    group: AgProvidedColumnGroup,
    location: HeaderLocation
): string | null {
    return beans.colNames.getDisplayNameForProvidedColumnGroup(
        null,
        getGridColumnGroup(beans, group),
        location,
        group.colGroupDef
    );
}
