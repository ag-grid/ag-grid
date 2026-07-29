import type { AgColumn } from '../../entities/agColumn';

/** The `groupId` a user column should be persisted against: the nearest real (non-padding) group
 *  containing `column`, or `null` when it sits at the top level. Padding groups are skipped as they are
 *  rebuilt per column-def shape and carry no user-meaningful identity.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getParentGroupId(column: AgColumn | null | undefined): string | null {
    let group = column?.getOriginalParent() ?? null;
    while (group !== null) {
        if (!group.isPadding()) {
            return group.groupId;
        }
        group = group.getOriginalParent();
    }
    return null;
}
