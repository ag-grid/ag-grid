// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../context/beanStub";
import { HeaderContainer } from "../headerContainer";
import { HeaderPosition } from "./headerPosition";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { HeaderRowType } from "../headerRowComp";
import { HeaderRootComp, HeaderContainerPosition } from "../headerRootComp";
export declare enum HeaderNavigationDirection {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
}
export declare class HeaderNavigationService extends BeanStub {
    private focusController;
    private headerPositionUtils;
    private animationFrameService;
    private controllersService;
    private gridBodyCon;
    private headerRoot;
    private postConstruct;
    registerHeaderRoot(headerRoot: HeaderRootComp): void;
    getHeaderRowCount(): number;
    getHeaderRowType(idx: number): HeaderRowType | undefined;
    getHeaderContainer(position?: HeaderContainerPosition | null | undefined): HeaderContainer | undefined;
    navigateVertically(direction: HeaderNavigationDirection, fromHeader: HeaderPosition | null, event: KeyboardEvent): boolean;
    navigateHorizontally(direction: HeaderNavigationDirection, fromTab: boolean | undefined, event: KeyboardEvent): boolean;
    private focusNextHeaderRow;
    scrollToColumn(column: Column | ColumnGroup, direction?: 'Before' | 'After' | null): void;
}
