import {Bean, PostConstruct, Autowired} from "../../context/context";
import {Utils as _} from '../../utils';
import {ICellRenderer, ICellRendererFunc} from "./iCellRenderer";
import {AnimateSlideCellRenderer} from "./animateSlideCellRenderer";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {EventService} from "../../eventService";
import {ExpressionService} from "../../expressionService";
import {SelectionRendererFactory} from "../../selectionRendererFactory";
import {groupCellRendererFactory} from "./groupCellRendererFactory";

@Bean('cellRendererFactory')
export class CellRendererFactory {

    private static ANIMATE_SLIDE = 'animateSlide';
    private static GROUP = 'group';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionRendererFactory') private selectionRendererFactory: SelectionRendererFactory;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('eventService') private eventService: EventService;

    private cellRendererMap: {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} = {};

    @PostConstruct
    private init(): void {
        this.cellRendererMap[CellRendererFactory.ANIMATE_SLIDE] = AnimateSlideCellRenderer;
        this.cellRendererMap[CellRendererFactory.GROUP] = groupCellRendererFactory(this.gridOptionsWrapper, this.selectionRendererFactory, this.expressionService, this.eventService);
    }

    public addCellRenderer(key: string, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc): void {
        this.cellRendererMap[key] = cellRenderer;
    }

    public getCellRenderer(key: string): {new(): ICellRenderer} | ICellRendererFunc {

        var result = this.cellRendererMap[key];
        if (_.missing(result)) {
            console.warn('ag-Grid: unable to find cellRenderer for key ' + key);
            return null;
        }

        return result;
    }
}
