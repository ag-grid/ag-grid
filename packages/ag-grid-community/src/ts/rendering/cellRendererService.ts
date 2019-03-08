import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { Autowired, Bean } from "../context/context";
import { UserComponentFactoryHelper } from "../components/framework/userComponentFactoryHelper";
import { ColDef } from "../entities/colDef";
import { GroupCellRendererParams } from "./cellRenderers/groupCellRenderer";
import { UserComponentFactory, ComponentSource, ResolvedComponent } from "../components/framework/userComponentFactory";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { IRichCellEditorParams } from "../interfaces/iRichCellEditorParams";
import { ISetFilterParams } from "../interfaces/iSetFilterParams";
import { _, Promise } from "../utils";

/** Class to use a cellRenderer. */
@Bean('cellRendererService')
export class CellRendererService {

    @Autowired('userComponentFactoryHelper') private userComponentFactoryHelper: UserComponentFactoryHelper;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public useFilterCellRenderer(
        target: ColDef,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        const cellRendererPromise: Promise<ICellRendererComp> = this.userComponentFactoryHelper.newCellRenderer((target.filterParams as ISetFilterParams), params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        } else {
            if (params.valueFormatted == null && params.value == null) {
                const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            } else {
                eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
            }
        }
        return cellRendererPromise;
    }

    public useRichSelectCellRenderer(
        target: IRichCellEditorParams,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        const cellRendererPromise: Promise<ICellRendererComp> = this.userComponentFactoryHelper.newCellRenderer(target, params);
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
        const componentToUse: ResolvedComponent<any, any> = this.userComponentFactory.getComponentToUse(target, "innerRenderer", null);

        if (componentToUse && componentToUse.component != null && componentToUse.source != ComponentSource.DEFAULT) {
            // THERE IS ONE INNER CELL RENDERER HARDCODED IN THE COLDEF FOR THIS GROUP COLUMN
            rendererToUsePromise = this.userComponentFactoryHelper.newInnerCellRenderer(target, params);
        } else {
            const otherRenderer: ResolvedComponent<any, any> = this.userComponentFactory.getComponentToUse(originalColumn, "cellRenderer", null);
            if (otherRenderer && otherRenderer.source != ComponentSource.DEFAULT) {
                // Only if the original column is using an specific renderer, it it is a using a DEFAULT one
                // ignore it
                // THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, WE REUSE ITS RENDERER
                rendererToUsePromise = this.userComponentFactoryHelper.newCellRenderer(originalColumn, params);
            } else if (otherRenderer && otherRenderer.source == ComponentSource.DEFAULT && (_.get(originalColumn, 'cellRendererParams.innerRenderer', null))) {
                // EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                // AND HAS A INNER CELL RENDERER
                rendererToUsePromise = this.userComponentFactoryHelper.newInnerCellRenderer(originalColumn.cellRendererParams, params);
            } else {
                // This forces the retrieval of the default plain cellRenderer that just renders the values.
                rendererToUsePromise = this.userComponentFactoryHelper.newCellRenderer({}, params);
            }
        }
        if (rendererToUsePromise != null) {
            rendererToUsePromise.then(rendererToUse => {
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
        const cellRendererPromise: Promise<ICellRendererComp> = this.userComponentFactoryHelper.newFullWidthGroupRowInnerCellRenderer (params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    }

    public bindToHtml(cellRendererPromise: Promise<ICellRendererComp>, eTarget: HTMLElement) {
        cellRendererPromise.then(cellRenderer => {
            const gui: HTMLElement | string = cellRenderer.getGui();
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