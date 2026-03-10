/**
 * ## How Ranking Works
 *
 * When we upload the index to algolia we configure the index, see
 * index.setSettings(...) in updateAlgolia().
 *
 * Algolia ranks results first by their own internal text relevance algorithm,
 * then by our "rank" property - but this is only used as a tie-breaker for
 * similarly relevant items. They strongly recommend not changing this.
 *
 * The algorithm for generating the rank is:
 *
 * - For most docs pages, rank is the order in the menu, so earlier items appear first
 * - For migration docs pages, MIGRATION_DOCS_RANK_OFFSET is added to the rank so that
 *   they appear last among equally relevant matches
 * - For API pages, rank is the order in the API nav plus API_PROPERTIES_RANK_OFFSET,
 *   so equally relevant API matches appear after docs matches by default
 */

export const API_PROPERTIES_RANK_OFFSET = 10000;

export const MIGRATION_DOCS_RANK_OFFSET = 20000;

/**
 * Controls which types should have their nested properties indexed.
 *
 * IMPORTANT this just controls whether indexing descends into the *properties*
 * of a type.
 *
 * Normally, if a property is of type X, all properties of that type are added
 * as codeWords for the API entry, so for example searching "headerFooterConfig"
 * (a member of the ExcelExportParams interface) should bring up the
 * defaultExcelExportParams grid option.
 *
 * This can be disabled by adding either the property name
 * ("defaultExcelExportParams") or type name ("ExcelExportParams") to this map.
 *
 * Values:
 *   - "never": Never index properties of this type/property
 *   - "not-for-function-argument": Don't index when type appears as function
 *                                   argument, but DO index when it appears as a
 *                                   property type
 */
export const TYPE_PROPERTY_INDEXING: Record<string, 'never' | 'not-for-function-argument'> = {
    // Grid-created types that appear in lots of API methods, we don't want all
    // those API methods to show up when we search for a property of this type
    IRowNode: 'never',
    Column: 'never',
    ColumnGroup: 'never',
    ProvidedColumnGroup: 'never',
    GridApi: 'never',

    // Lots of API methods take a ColDef as an argument, these should show up
    // when we search for "ColDef" but not when we search for any property of a
    // ColDef like "suppressStickyLabel"
    ColDef: 'not-for-function-argument',
    GridOptions: 'not-for-function-argument',
    ColGroupDef: 'not-for-function-argument',

    defaultColDef: 'never',
    defaultColGroupDef: 'never',
};
