import {Bean, PostConstruct, Autowired} from "../context/context";
import {Utils as _} from '../utils';
import {ICellRenderer, ICellRendererFunc} from "./cellRenderers/iCellRenderer";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {EventService} from "../eventService";
import {ExpressionService} from "../expressionService";
import {AnimateSlideCellRenderer} from "./cellRenderers/animateSlideCellRenderer";
import {AnimateShowChangeCellRenderer} from "./cellRenderers/animateShowChangeCellRenderer";
import {GroupCellRenderer} from "./cellRenderers/groupCellRenderer";

@Bean('cellRendererFactory')
export class CellRendererFactory {

    public static ANIMATE_SLIDE = 'animateSlide';
    public static ANIMATE_SHOW_CHANGE = 'animateShowChange';
    public static GROUP = 'group';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('eventService') private eventService: EventService;

    private cellRendererMap: {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} = {};

    @PostConstruct
    private init(): void {
        this.cellRendererMap[CellRendererFactory.ANIMATE_SLIDE] = AnimateSlideCellRenderer;
        this.cellRendererMap[CellRendererFactory.ANIMATE_SHOW_CHANGE] = AnimateShowChangeCellRenderer;
        this.cellRendererMap[CellRendererFactory.GROUP] = GroupCellRenderer;

        // this.registerRenderersFromGridOptions();
    }

    // private registerRenderersFromGridOptions(): void {
    //     var userProvidedCellRenderers = this.gridOptionsWrapper.getCellRenderers();
    //     _.iterateObject(userProvidedCellRenderers, (key: string, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc)=> {
    //         this.addCellRenderer(key, cellRenderer);
    //     });
    // }

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
