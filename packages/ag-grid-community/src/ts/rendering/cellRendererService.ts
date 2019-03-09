import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { Autowired, Bean } from "../context/context";
import { UserComponentFactoryHelper } from "../components/framework/userComponentFactoryHelper";
import { ColDef } from "../entities/colDef";
import { GroupCellRendererParams } from "./cellRenderers/groupCellRenderer";
import { UserComponentFactory, ComponentSource, ComponentClassDef } from "../components/framework/userComponentFactory";
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
        groupCellRendererParams: GroupCellRendererParams,
        groupedColumnDef: ColDef, // the column this group row is for, eg 'Country'
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        // when grouping, the normal case is we use the cell renderer of the grouped column. eg if grouping by country
        // and then rating, we will use the country cell renderer for each country group row and likewise the rating
        // cell renderer for each rating group row.
        //
        // however if the user has innerCellRenderer defined, this gets preference and we don't use cell renderers
        // of the grouped columns.
        //
        // so we check and use in the following order:
        //
        // 1) thisColDef.cellRendererParams.innerRenderer of the column showing the groups (eg auto group column)
        // 2) groupedColDef.cellRenderer of the grouped column
        // 3) groupedColDef.cellRendererParams.innerRenderer

        let cellRendererPromise: Promise<ICellRendererComp> = null;
        // we check if cell renderer provided for the group cell renderer, eg colDef.cellRendererParams.innerRenderer
        const groupInnerRendererClass: ComponentClassDef<any, any> = this.userComponentFactory
            .getComponentClassDef(groupCellRendererParams, "innerRenderer");

        if (groupInnerRendererClass && groupInnerRendererClass.component != null
            && groupInnerRendererClass.source != ComponentSource.DEFAULT) {
            // use the renderer defined in cellRendererParams.innerRenderer
            cellRendererPromise = this.userComponentFactoryHelper.newInnerCellRenderer(groupCellRendererParams, params);
        } else {
            // otherwise see if we can use the cellRenderer of the column we are grouping by
            const groupColumnRendererClass: ComponentClassDef<any, any> = this.userComponentFactory
                .getComponentClassDef(groupedColumnDef, "cellRenderer");
            if (groupColumnRendererClass && groupColumnRendererClass.source != ComponentSource.DEFAULT) {
                // Only if the original column is using a specific renderer, it it is a using a DEFAULT one ignore it
                cellRendererPromise = this.userComponentFactoryHelper.newCellRenderer(groupedColumnDef, params);
            } else if (groupColumnRendererClass && groupColumnRendererClass.source == ComponentSource.DEFAULT
                && (_.get(groupedColumnDef, 'cellRendererParams.innerRenderer', null))) {
                // EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                // AND HAS A INNER CELL RENDERER
                cellRendererPromise = this.userComponentFactoryHelper.newInnerCellRenderer(groupedColumnDef.cellRendererParams, params);
            } else {
                // This forces the retrieval of the default plain cellRenderer that just renders the values.
                cellRendererPromise = this.userComponentFactoryHelper.newCellRenderer({}, params);
            }
        }
        if (cellRendererPromise != null) {
            cellRendererPromise.then(rendererToUse => {
                if (rendererToUse == null) {
                    eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
                    return;
                }
                this.bindToHtml(cellRendererPromise, eTarget);
            });
        } else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
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