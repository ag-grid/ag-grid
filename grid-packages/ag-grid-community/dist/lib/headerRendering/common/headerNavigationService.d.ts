import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
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
    private ctrlsService;
    private gridBodyCon;
    private currentHeaderRowWithoutSpan;
    private postConstruct;
    getHeaderRowCount(): number;
    navigateVertically(direction: HeaderNavigationDirection, fromHeader: HeaderPosition | null, event: KeyboardEvent): boolean;
    setCurrentHeaderRowWithoutSpan(row: number): void;
    navigateHorizontally(direction: HeaderNavigationDirection, fromTab: boolean | undefined, event: KeyboardEvent): boolean;
    private focusNextHeaderRow;
    scrollToColumn(column: Column | ColumnGroup, direction?: 'Before' | 'After' | null): void;
}
