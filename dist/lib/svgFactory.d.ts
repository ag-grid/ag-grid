// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export default class SvgFactory {
    static theInstance: SvgFactory;
    static getInstance(): SvgFactory;
    createFilterSvg(): Element;
    createColumnShowingSvg(): Element;
    createColumnHiddenSvg(): Element;
    createMenuSvg(): Element;
    createArrowUpSvg(): Element;
    createArrowLeftSvg(): Element;
    createArrowDownSvg(): Element;
    createArrowRightSvg(): Element;
    createSmallArrowDownSvg(): Element;
    createArrowUpDownSvg(): Element;
}
