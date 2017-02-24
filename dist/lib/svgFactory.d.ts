// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class SvgFactory {
    static theInstance: SvgFactory;
    private static imageCache;
    static getInstance(): SvgFactory;
    createFilterSvg(): HTMLElement;
    createFilterSvg12(): HTMLElement;
    createMenuSvg(): HTMLElement;
    createColumnsSvg12(): Element;
    createArrowUpSvg(): HTMLElement;
    createArrowLeftSvg(): HTMLElement;
    createArrowDownSvg(): HTMLElement;
    createArrowRightSvg(): HTMLElement;
    createSmallArrowRightSvg(): HTMLElement;
    createSmallArrowLeftSvg(): HTMLElement;
    createSmallArrowDownSvg(): HTMLElement;
    createArrowUpDownSvg(): HTMLElement;
    private static getFromCacheOrCreate(key, data);
    createFolderOpen(): HTMLImageElement;
    createFolderClosed(): HTMLImageElement;
    createColumnIcon(): HTMLImageElement;
    createColumnsIcon(): HTMLImageElement;
    createPinIcon(): HTMLImageElement;
    createPlusIcon(): HTMLImageElement;
    createMinusIcon(): HTMLImageElement;
    createMoveIcon(): HTMLImageElement;
    createLeftIcon(): HTMLImageElement;
    createRightIcon(): HTMLImageElement;
    createColumnVisibleIcon(): HTMLImageElement;
    createColumnHiddenIcon(): HTMLImageElement;
    createColumnIndeterminateIcon(): HTMLImageElement;
    createGroupIcon(): HTMLImageElement;
    createPivotIcon(): HTMLImageElement;
    createAggregationIcon(): HTMLImageElement;
    createDropNotAllowedIcon(): HTMLImageElement;
    createGroupIcon12(): HTMLImageElement;
    createCutIcon(): HTMLImageElement;
    createCopyIcon(): HTMLImageElement;
    createPasteIcon(): HTMLImageElement;
    createMenuIcon(): HTMLImageElement;
    createCheckboxCheckedIcon(): HTMLImageElement;
    createCheckboxCheckedReadOnlyIcon(): HTMLImageElement;
    createCheckboxUncheckedIcon(): HTMLImageElement;
    createCheckboxUncheckedReadOnlyIcon(): HTMLImageElement;
    createCheckboxIndeterminateIcon(): HTMLImageElement;
    createCheckboxIndeterminateReadOnlyIcon(): HTMLImageElement;
    createGroupExpandedIcon(): HTMLImageElement;
    createGroupContractedIcon(): HTMLImageElement;
}
