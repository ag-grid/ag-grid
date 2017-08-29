import {ICellRendererComp} from "./cellRenderers/iCellRenderer";
import {Autowired, Bean} from "../context/context";
import {ComponentRecipes} from "../components/framework/componentRecipes";
import {ColDef} from "../entities/colDef";
import {GroupCellRendererParams} from "./cellRenderers/groupCellRenderer";
import {ComponentResolver, ComponentSource, ResolvedComponent} from "../components/framework/componentResolver";
import {ISetFilterParams} from "../interfaces/iSetFilterParams";
import {_} from "../utils";

/** Class to use a cellRenderer. */
@Bean('cellRendererService')
export class CellRendererService {
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;

    public useCellRenderer(
        target:ColDef,
        eTarget: HTMLElement,
        params: any
    ): ICellRendererComp {
        let cellRenderer: ICellRendererComp = this.componentRecipes.newCellRenderer (target, params);
        if (cellRenderer != null) {
            this.bindToHtml(cellRenderer, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRenderer;
    }

    public useFilterCellRenderer(
        target:ColDef,
        eTarget: HTMLElement,
        params: any
    ): ICellRendererComp {
        let cellRenderer: ICellRendererComp = this.componentRecipes.newCellRenderer((<ISetFilterParams>target.filterParams), params);
        if (cellRenderer != null) {
            this.bindToHtml(cellRenderer, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRenderer;
    }

    public useInnerCellRenderer(
        target:GroupCellRendererParams,
        originalColumn:ColDef,
        eTarget: HTMLElement,
        params: any
    ): ICellRendererComp {
        let rendererToUse:ICellRendererComp = null;
        let componentToUse:ResolvedComponent<any, any> = this.componentResolver.getComponentToUse(target, "innerRenderer");

        if (componentToUse && componentToUse.component != null && componentToUse.source != ComponentSource.DEFAULT){
            //THERE IS ONE INNER CELL RENDERER HARDCODED IN THE COLDEF FOR THIS GROUP COLUMN
            rendererToUse = this.componentRecipes.newInnerCellRenderer(target, params);
        } else {
            let otherRenderer: ResolvedComponent<any, any> = this.componentResolver.getComponentToUse(originalColumn, "cellRenderer");
            if (otherRenderer && otherRenderer.source != ComponentSource.DEFAULT){
                //Only if the original column is using an specific renderer, it it is a using a DEFAULT one
                //ignore it
                //THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, WE REUSE ITS RENDERER
                rendererToUse = this.componentRecipes.newCellRenderer(originalColumn, params);
            } else if (otherRenderer && otherRenderer.source == ComponentSource.DEFAULT && (_.get(originalColumn, 'cellRendererParams.innerRenderer', null))) {
                //EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                //AND HAS A INNER CELL RENDERER
                rendererToUse = this.componentRecipes.newInnerCellRenderer(originalColumn.cellRendererParams, params);
            } else {
                //This forces the retrieval of the default plain cellRenderer that just renders the values.
                rendererToUse = this.componentRecipes.newCellRenderer({}, params);
            }
        }
        if (rendererToUse != null) {
            this.bindToHtml(rendererToUse, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return rendererToUse;
    }

    public useFullWidthGroupRowInnerCellRenderer(
        eTarget: HTMLElement,
        params: any
    ): ICellRendererComp {
        let cellRenderer: ICellRendererComp = this.componentRecipes.newFullWidthGroupRowInnerCellRenderer (params);
        if (cellRenderer != null) {
            this.bindToHtml(cellRenderer, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRenderer;
    }


    public bindToHtml(cellRenderer: ICellRendererComp, eTarget: HTMLElement) {
        let gui: HTMLElement|string = cellRenderer.getGui();
        if (gui != null) {
            if (typeof gui == 'object'){
                eTarget.appendChild(gui);
            } else {
                eTarget.innerHTML = gui;
            }
        }

        return cellRenderer;
    }



}