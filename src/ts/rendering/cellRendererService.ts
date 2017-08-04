import {ICellRendererComp} from "./cellRenderers/iCellRenderer";
import {Autowired, Bean} from "../context/context";
import {ComponentRecipes} from "../components/framework/componentRecipes";
import {ColDef} from "../entities/colDef";
import {GroupCellRendererParams} from "./cellRenderers/groupCellRenderer";
import {ComponentResolver, ComponentSource, ResolvedComponent} from "../components/framework/componentResolver";

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
        return this.bindToHtml(cellRenderer, eTarget);
    }

    public useInnerCellRenderer(
        target:GroupCellRendererParams,
        originalColumn:ColDef,
        eTarget: HTMLElement,
        params: any
    ): ICellRendererComp {
        let rendererToUse:ICellRendererComp = null;
        let componentToUse:ResolvedComponent<any, any> = this.componentResolver.getComponentToUse(target, "innerRenderer");

        if (componentToUse.component != null && componentToUse.source != ComponentSource.DEFAULT){
            rendererToUse = this.componentRecipes.newInnerCellRenderer(target, params);
        } else {
            let otherRenderer: ResolvedComponent<any, any> = this.componentResolver.getComponentToUse(originalColumn, "cellRenderer");
            if (otherRenderer.source != ComponentSource.DEFAULT){
                //Only if the original column is using an specific renderer, it it is a using a DEFAULT one
                //ignore it
                rendererToUse = this.componentRecipes.newCellRenderer(originalColumn, params);
            } else {
                //This forces the retrieval of the default plain cellRenderer that just renders the values.
                rendererToUse = this.componentRecipes.newCellRenderer({}, params);
            }
        }

        return this.bindToHtml(rendererToUse, eTarget);
    }


    public bindToHtml(cellRenderer: ICellRendererComp, eTarget: HTMLElement) {
        let gui: HTMLElement = cellRenderer.getGui();
        if (gui != null) {
            if (typeof gui == 'object'){
                eTarget.appendChild(gui);
            } else {
                eTarget.textContent = gui;
            }
        }

        return cellRenderer;
    }


    public useFullRowGroupRenderer (eTarget: HTMLElement, params:any):ICellRendererComp{
        let cellRenderer: ICellRendererComp = this.componentRecipes.newFullRowGroupRenderer (params);
        eTarget.appendChild( cellRenderer.getGui());
        return cellRenderer;
    }

}