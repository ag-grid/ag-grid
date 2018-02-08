import {ICellRendererComp} from "./cellRenderers/iCellRenderer";
import {Autowired, Bean} from "../context/context";
import {ComponentRecipes} from "../components/framework/componentRecipes";
import {ColDef} from "../entities/colDef";
import {GroupCellRendererParams} from "./cellRenderers/groupCellRenderer";
import {ComponentResolver, ComponentSource, ResolvedComponent} from "../components/framework/componentResolver";
import {_, Promise} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {IRichCellEditorParams} from "../interfaces/iRichCellEditorParams";
import {ISetFilterParams} from "../interfaces/iSetFilterParams";

/** Class to use a cellRenderer. */
@Bean('cellRendererService')
export class CellRendererService {
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public useCellRenderer(
        target: ColDef,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        let cellRendererPromise: Promise<ICellRendererComp> = this.componentRecipes.newCellRenderer (target, params);
        if (cellRendererPromise != null) {
            cellRendererPromise.then(cellRenderer=> {
                if (cellRenderer == null) {
                    eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
                } else {
                    this.bindToHtml(cellRendererPromise, eTarget);
                }
            });
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    }

    public useFilterCellRenderer(
        target: ColDef,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        let cellRendererPromise: Promise<ICellRendererComp> = this.componentRecipes.newCellRenderer((<ISetFilterParams>target.filterParams), params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        } else {
            if(params.valueFormatted == null && params.value == null) {
                let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            } else {
                eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
            }
        }
        return cellRendererPromise;
    }

    public useRichSelectCellRenderer(
        target: ColDef,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        let cellRendererPromise: Promise<ICellRendererComp> = this.componentRecipes.newCellRenderer((<IRichCellEditorParams>target.cellEditorParams), params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    }

    public useInnerCellRenderer(
        target: GroupCellRendererParams,
        originalColumn: ColDef,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        let rendererToUsePromise: Promise<ICellRendererComp> = null;
        let componentToUse: ResolvedComponent<any, any> = this.componentResolver.getComponentToUse(target, "innerRenderer", null);

        if (componentToUse && componentToUse.component != null && componentToUse.source != ComponentSource.DEFAULT) {
            //THERE IS ONE INNER CELL RENDERER HARDCODED IN THE COLDEF FOR THIS GROUP COLUMN
            rendererToUsePromise = this.componentRecipes.newInnerCellRenderer(target, params);
        } else {
            let otherRenderer: ResolvedComponent<any, any> = this.componentResolver.getComponentToUse(originalColumn, "cellRenderer", null);
            if (otherRenderer && otherRenderer.source != ComponentSource.DEFAULT) {
                //Only if the original column is using an specific renderer, it it is a using a DEFAULT one
                //ignore it
                //THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, WE REUSE ITS RENDERER
                rendererToUsePromise = this.componentRecipes.newCellRenderer(originalColumn, params);
            } else if (otherRenderer && otherRenderer.source == ComponentSource.DEFAULT && (_.get(originalColumn, 'cellRendererParams.innerRenderer', null))) {
                //EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                //AND HAS A INNER CELL RENDERER
                rendererToUsePromise = this.componentRecipes.newInnerCellRenderer(originalColumn.cellRendererParams, params);
            } else {
                //This forces the retrieval of the default plain cellRenderer that just renders the values.
                rendererToUsePromise = this.componentRecipes.newCellRenderer({}, params);
            }
        }
        if (rendererToUsePromise != null) {
            rendererToUsePromise.then(rendererToUse=> {
                if (rendererToUse == null) {
                    eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
                    return;
                }
                this.bindToHtml(rendererToUsePromise, eTarget);
            });
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return rendererToUsePromise;
    }

    public useFullWidthGroupRowInnerCellRenderer(
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        let cellRendererPromise: Promise<ICellRendererComp> = this.componentRecipes.newFullWidthGroupRowInnerCellRenderer (params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    }

    public bindToHtml(cellRendererPromise: Promise<ICellRendererComp>, eTarget: HTMLElement) {
        cellRendererPromise.then(cellRenderer=> {
            let gui: HTMLElement|string = cellRenderer.getGui();
            if (gui != null) {
                if (typeof gui == 'object') {
                    eTarget.appendChild(gui);
                } else {
                    eTarget.innerHTML = gui;
                }
            }

        });
        return cellRendererPromise;
    }
}