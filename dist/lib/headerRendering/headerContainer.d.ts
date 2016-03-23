// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
export declare class HeaderContainer {
    private gridOptionsWrapper;
    private context;
    private $scope;
    private dragAndDropService;
    private columnController;
    private gridPanel;
    private eContainer;
    private eViewport;
    private eRoot;
    private pinned;
    private headerElements;
    private dropTarget;
    constructor(eContainer: HTMLElement, eViewport: HTMLElement, eRoot: HTMLElement, pinned: string);
    init(): void;
    removeAllChildren(): void;
    insertHeaderRowsIntoContainer(): void;
    private addTreeNodesAtDept(cellTree, dept, result);
    private createHeaderElement(columnGroupChild);
    onIndividualColumnResized(column: Column): void;
}
