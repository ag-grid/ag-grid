// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export default class PopupService {
    private ePopupParent;
    init(ePopupParent: any): void;
    positionPopup(eventSource: any, ePopup: any, keepWithinBounds: boolean): void;
    addAsModalPopup(eChild: any, closeOnEsc: boolean): (event: any) => void;
}
