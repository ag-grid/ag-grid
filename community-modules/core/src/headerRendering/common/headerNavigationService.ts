import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../../context/context";
import { CtrlsService } from "../../ctrlsService";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { GridBodyCtrl } from "../../gridBodyComp/gridBodyCtrl";
import { last } from "../../utils/array";
import { HeaderPosition, HeaderPositionUtils } from "./headerPosition";

export enum HeaderNavigationDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

@Bean('headerNavigationService')
export class HeaderNavigationService extends BeanStub {

    @Autowired('headerPositionUtils') private headerPositionUtils: HeaderPositionUtils;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private gridBodyCon: GridBodyCtrl;
    private currentHeaderRowWithoutSpan: number = -1;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.gridBodyCon = p.gridBodyCtrl;
        });

        const eDocument = this.gos.getDocument();
        this.addManagedListener(eDocument, 'mousedown', () => this.setCurrentHeaderRowWithoutSpan(-1));
    }

    public getHeaderRowCount(): number {
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        return centerHeaderContainer ? centerHeaderContainer.getRowCount() : 0;
    }

    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateVertically(direction: HeaderNavigationDirection, fromHeader: HeaderPosition | null, event: KeyboardEvent): boolean {
        if (!fromHeader) {
        }

        if (!fromHeader) { return false; }

        const { headerRowIndex, column } = fromHeader;
        const rowLen = this.getHeaderRowCount();
        const isUp = direction === HeaderNavigationDirection.UP;

        let { headerRowIndex: nextRow, column: nextFocusColumn, headerRowIndexWithoutSpan } = isUp
            ? this.headerPositionUtils.getColumnVisibleParent(column, headerRowIndex)
            : this.headerPositionUtils.getColumnVisibleChild(column, headerRowIndex);

        let skipColumn = false;

        if (nextRow < 0) {
            nextRow = 0;
            nextFocusColumn = column;
            skipColumn = true;
        }

        if (nextRow >= rowLen) {
            nextRow = -1; // -1 indicates the focus should move to grid rows.
            this.setCurrentHeaderRowWithoutSpan(-1);
        } else if (headerRowIndexWithoutSpan !== undefined) {
            this.currentHeaderRowWithoutSpan = headerRowIndexWithoutSpan;
        }


        if (!skipColumn && !nextFocusColumn) {
            return false;
        }

        return false;
    }

    public setCurrentHeaderRowWithoutSpan(row: number): void {
        this.currentHeaderRowWithoutSpan = row;
    }

    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateHorizontally(direction: HeaderNavigationDirection, fromTab: boolean = false, event: KeyboardEvent): boolean {
        return false;
    }

}
