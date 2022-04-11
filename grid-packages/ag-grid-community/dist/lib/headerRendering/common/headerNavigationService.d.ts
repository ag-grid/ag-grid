import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderRowType } from "../row/headerRowComp";
import { HeaderPosition } from "./headerPosition";
export declare enum HeaderNavigationDirection {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
}
export declare class HeaderNavigationService extends BeanStub {
    private focusService;
    private headerPositionUtils;
    private animationFrameService;
    private ctrlsService;
    private gridBodyCon;
    private postConstruct;
    getHeaderRowCount(): number;
    getHeaderRowType(rowIndex: number): HeaderRowType | undefined;
    navigateVertically(direction: HeaderNavigationDirection, fromHeader: HeaderPosition | null, event: KeyboardEvent): boolean;
    navigateHorizontally(direction: HeaderNavigationDirection, fromTab: boolean | undefined, event: KeyboardEvent): boolean;
    private focusNextHeaderRow;
    scrollToColumn(column: Column | ColumnGroup, direction?: 'Before' | 'After' | null): void;
}
