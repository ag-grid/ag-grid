import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { Column, ColumnGroup } from '../../interfaces/iColumn';
import type { HeaderPosition } from './headerPosition';
export declare enum HeaderNavigationDirection {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
}
export declare class HeaderNavigationService extends BeanStub implements NamedBean {
    beanName: "headerNavigationService";
    private focusService;
    private headerPositionUtils;
    private ctrlsService;
    private columnModel;
    private visibleColService;
    wireBeans(beans: BeanCollection): void;
    private gridBodyCon;
    private currentHeaderRowWithoutSpan;
    postConstruct(): void;
    getHeaderRowCount(): number;
    getHeaderPositionForColumn(colKey: string | Column | ColumnGroup, floatingFilter: boolean): HeaderPosition | null;
    navigateVertically(direction: HeaderNavigationDirection, fromHeader: HeaderPosition | null, event: KeyboardEvent): boolean;
    setCurrentHeaderRowWithoutSpan(row: number): void;
    navigateHorizontally(direction: HeaderNavigationDirection, fromTab: boolean | undefined, event: KeyboardEvent): boolean;
    private focusNextHeaderRow;
    scrollToColumn(column: AgColumn | AgColumnGroup, direction?: 'Before' | 'After' | null): void;
}
