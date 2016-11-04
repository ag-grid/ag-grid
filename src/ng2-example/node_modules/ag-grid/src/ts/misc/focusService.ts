import {Bean, PostConstruct, Autowired, PreDestroy} from "../context/context";
import {Utils as _} from '../utils';
import {GridCore} from "../gridCore";
import {Column} from "../entities/column";
import {ColumnController} from "../columnController/columnController";
import {RowNode} from "../entities/rowNode";
import {Constants} from "../constants";
import {GridCell} from "../entities/gridCell";

// tracks when focus goes into a cell. cells listen to this, so they know to stop editing
// if focus goes into another cell.

/** THIS IS NOT USED - it was something Niall was working on, but doesn't work well with popup editors */

@Bean('focusService')
export class FocusService {

    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('columnController') private columnController: ColumnController;

    private destroyMethods: Function[] = [];
    
    private listeners: ((event: any)=>void)[] = [];

    public addListener(listener: (focusEvent: FocusEvent)=>void): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: (focusEvent: FocusEvent)=>void): void {
        _.removeFromArray(this.listeners, listener);
    }
    
    @PostConstruct
    private init(): void {
        var focusListener = this.onFocus.bind(this);
        var eRootGui = this.gridCore.getRootGui();
        eRootGui.addEventListener('focus', focusListener, true);
        this.destroyMethods.push( () => {
            eRootGui.removeEventListener('focus', focusListener);
        });
    }

    private onFocus(focusEvent: FocusEvent): void {
        var gridCell = this.getCellForFocus(focusEvent);
        if (gridCell) {
            this.informListeners({gridCell: gridCell});
        }
    }

    private getCellForFocus(focusEvent: FocusEvent): GridCell {
        var column: Column = null;
        var row: number  = null;
        var floating: string = null;
        var that = this;

        var eTarget = <Node> focusEvent.target;
        while (eTarget) {
            checkRow(eTarget);
            checkColumn(eTarget);
            eTarget = eTarget.parentNode;
        }

        if (_.exists(column) && _.exists(row)) {
            var gridCell = new GridCell(row, floating, column);
            return gridCell;
        } else {
            return null;
        }

        function checkRow(eTarget: Node): void {
            // match the column by checking a) it has a valid colId and b) it has the 'ag-cell' class
            var rowId = _.getElementAttribute(eTarget, 'row');
            if (_.exists(rowId) && _.containsClass(eTarget, 'ag-row')) {
                if (rowId.indexOf('ft')===0) {
                    floating = Constants.FLOATING_TOP;
                    rowId = rowId.substr(3);
                } else if (rowId.indexOf('fb')===0) {
                    floating = Constants.FLOATING_BOTTOM;
                    rowId = rowId.substr(3);
                } else {
                    floating = null;
                }
                row = parseInt(rowId);
            }
        }

        function checkColumn(eTarget: Node): void {
            // match the column by checking a) it has a valid colId and b) it has the 'ag-cell' class
            var colId = _.getElementAttribute(eTarget, 'colid');
            if (_.exists(colId) && _.containsClass(eTarget, 'ag-cell')) {
                var foundColumn = that.columnController.getGridColumn(colId);
                if (foundColumn) {
                    column = foundColumn;
                }
            }
        }
    }

    private informListeners(event: any): void {
        this.listeners.forEach( listener => listener(event) );
    }

    @PreDestroy
    private destroy(): void {
        this.destroyMethods.forEach( destroyMethod => destroyMethod() );
    }

}
