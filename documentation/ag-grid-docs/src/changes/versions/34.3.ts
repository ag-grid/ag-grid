import type { VersionChangelog } from '@ag-website-shared/changes/change-types';

export const v34_3 = {
    deprecations: {
        rowGroupingHierarchy: {
            oldApi: '`rowGroupingHierarchy` in `ColDef`',
            newApi: '`groupHierarchy` in `ColDef`',
            detectWords: ['rowGroupingHierarchy'],
            mitigation:
                'Rename the `rowGroupingHierarchy` property on your column definitions to `groupHierarchy`. The value is unchanged — both accept the same `(GroupHierarchyParts | string | ColDef)[]` array. If both are set on the same column, `groupHierarchy` takes precedence.',
        },
    },
} satisfies VersionChangelog;
