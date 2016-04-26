import {Utils as _} from "../utils";
import {ICellRenderer, ICellRendererFunc} from "./cellRenderers/iCellRenderer";
import {Autowired, Context, Bean} from "../context/context";
import {CellRendererFactory} from "./cellRendererFactory";

/** Class to use a cellRenderer. */
@Bean('cellRendererService')
export class CellRendererService {

    @Autowired('cellRendererFactory') private cellRendererFactory: CellRendererFactory;
    @Autowired('context') private context: Context;

    /** Uses a cellRenderer, and returns the cellRenderer object if it is a class implementing ICellRenderer.
     * @cellRendererKey: The cellRenderer to use. Can be: a) a class that we call 'new' on b) a function we call
     *                   or c) a string that we use to look up the cellRenderer.
     * @params: The params to pass to the cell renderer if it's a function or a class.
     * @eTarget: The DOM element we will put the results of the html element into *
     * @return: If options a, it returns the created class instance */
    public useCellRenderer(cellRendererKey: {new(): ICellRenderer} | ICellRendererFunc | string,
                            eTarget: HTMLElement,
                            params: any
                        ): ICellRenderer {

        var cellRenderer = this.lookUpCellRenderer(cellRendererKey);
        if (_.missing(cellRenderer)) {
            // this is a bug in users config, they specified a cellRenderer that doesn't exist,
            // the factory already printed to console, so here we just skip
            return;
        }

        var resultFromRenderer: HTMLElement | string;
        var iCellRendererInstance: ICellRenderer = null;

        this.checkForDeprecatedItems(cellRenderer);

        // we check if the class has the 'getGui' method to know if it's a component
        var rendererIsAComponent = this.doesImplementICellRenderer(cellRenderer);
        // if it's a component, we create and initialise it
        if (rendererIsAComponent) {
            var CellRendererClass = <{new(): ICellRenderer}> cellRenderer;
            iCellRendererInstance = new CellRendererClass();
            this.context.wireBean(iCellRendererInstance);

            if (iCellRendererInstance.init) {
                iCellRendererInstance.init(params);
            }

            resultFromRenderer = iCellRendererInstance.getGui();
        } else {
            // otherwise it's a function, so we just use it
            var cellRendererFunc = <ICellRendererFunc> cellRenderer;
            resultFromRenderer = cellRendererFunc(params);
        }

        if (resultFromRenderer===null || resultFromRenderer==='') {
            return;
        }

        if (_.isNodeOrElement(resultFromRenderer)) {
            // a dom node or element was returned, so add child
            eTarget.appendChild( <HTMLElement> resultFromRenderer);
        } else {
            // otherwise assume it was html, so just insert
            eTarget.innerHTML = <string> resultFromRenderer;
        }

        return iCellRendererInstance;
    }

    private checkForDeprecatedItems(cellRenderer: any) {
        if (cellRenderer && cellRenderer.renderer) {
            console.warn('ag-grid: colDef.cellRenderer should not be an object, it should be a string, function or class. this ' +
                'changed in v4.1.x, please check the documentation on Cell Rendering, or if you are doing grouping, look at the grouping examples.');
        }
    }

    private doesImplementICellRenderer(cellRenderer: {new(): ICellRenderer} | ICellRendererFunc): boolean {
        // see if the class has a prototype that defines a getGui method. this is very rough,
        // but javascript doesn't have types, so is the only way!
        return (<any>cellRenderer).prototype && 'getGui' in (<any>cellRenderer).prototype;
    }

    private lookUpCellRenderer(cellRendererKey: {new(): ICellRenderer} | ICellRendererFunc | string): ({new(): ICellRenderer} | ICellRendererFunc) {
        if (typeof cellRendererKey === 'string') {
            return this.cellRendererFactory.getCellRenderer(<string> cellRendererKey);
        } else {
            return <{new(): ICellRenderer} | ICellRendererFunc> cellRendererKey;
        }
    }
    
}