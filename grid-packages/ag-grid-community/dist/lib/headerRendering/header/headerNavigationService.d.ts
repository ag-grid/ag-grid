import { BeanStub } from "../../context/beanStub";
import { HeaderContainer } from "../headerContainer";
import { HeaderPosition } from "./headerPosition";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { HeaderRowType } from "../headerRowComp";
import { GridPanel } from "../../gridPanel/gridPanel";
import { HeaderRootComp, HeaderContainerPosition } from "../headerRootComp";
export declare enum HeaderNavigationDirection {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
}
export declare class HeaderNavigationService extends BeanStub {
    private gridOptionsWrapper;
    private focusController;
    private headerPositionUtils;
    private animationFrameService;
    private gridPanel;
    private headerRoot;
    registerGridComp(gridPanel: GridPanel): void;
    registerHeaderRoot(headerRoot: HeaderRootComp): void;
    getHeaderRowCount(): number;
    getHeaderRowType(idx: number): HeaderRowType;
    getHeaderContainer(position?: HeaderContainerPosition): HeaderContainer;
    navigateVertically(direction: HeaderNavigationDirection, fromHeader?: HeaderPosition): boolean;
    navigateHorizontally(direction: HeaderNavigationDirection, fromTab?: boolean): boolean;
    private focusNextHeaderRow;
    scrollToColumn(column: Column | ColumnGroup, direction?: 'Before' | 'After'): void;
}
