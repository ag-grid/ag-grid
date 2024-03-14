import {
    AgCheckbox,
    AgCheckboxParams,
    AgGroupComponent,
    AgRadioButton,
    AutoScrollService,
    Autowired,
    ChartType,
    DragAndDropService,
    DropTarget,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartMenuService } from "../../services/chartMenuService";
import { getMaxNumCategories } from "../../utils/seriesTypeMapper";
import { DragDataPanel } from "./dragDataPanel";

export class CategoriesDataPanel extends DragDataPanel {
    private static TEMPLATE = /* html */`<div id="categoriesGroup"></div>`;

    @Autowired('chartMenuService') private readonly chartMenuService: ChartMenuService;

    constructor(
        chartController: ChartController,
        autoScrollService: AutoScrollService,
        private dimensionCols: ColState[],
        private isOpen?: boolean
    ) {
        super(chartController, autoScrollService, CategoriesDataPanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.groupComp = this.createBean(new AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen
        }));
        if (this.chartMenuService.isLegacyFormat()) {
            this.createLegacyCategoriesGroup(this.dimensionCols);
        } else {
            this.createCategoriesGroup(this.dimensionCols);
        }
        this.getGui().appendChild(this.groupComp.getGui());
    }

    public refresh(dimensionCols: ColState[]): void {
        if (this.chartMenuService.isLegacyFormat()) {
            if (!this.refreshColumnComps(dimensionCols)) {
                this.recreate(dimensionCols);
            }
        } else {
            this.valuePillSelect?.setValues(dimensionCols, dimensionCols.filter(col => col.selected));
            this.refreshValueSelect(dimensionCols);
        }
    }

    private recreate(dimensionCols: ColState[]): void {
        this.isOpen = this.groupComp.isExpanded();
        _.clearElement(this.getGui());
        this.destroyBean(this.groupComp);
        this.dimensionCols = dimensionCols;
        this.init();
    }

    protected canHaveMultipleValues(chartType: ChartType): boolean {
        return getMaxNumCategories(chartType) !== 1;
    }

    private createCategoriesGroup(columns: ColState[]): void {
        this.createGroup(columns, (col) => _.escapeString(col?.displayName)!, 'categoryAdd', 'categorySelect');
    }

    private createLegacyCategoriesGroup(columns: ColState[]): void {
        const inputName = `chartDimension${this.groupComp.getCompId()}`;

        // Display either radio buttons or checkboxes
        // depending on whether the current chart type supports multiple category columns
        const chartType = this.chartController.getChartType();
        const supportsMultipleCategoryColumns = this.canHaveMultipleValues(chartType);

        columns.forEach(col => {
            const params: AgCheckboxParams = {
                label: _.escapeString(col.displayName)!,
                value: col.selected,
                inputName
            };
            const comp: AgCheckbox | AgRadioButton = this.groupComp!.createManagedBean(
                supportsMultipleCategoryColumns
                    ? (() => {
                        const checkboxComp = new AgCheckbox(params);
                        checkboxComp.addCssClass('ag-data-select-checkbox');
                        return checkboxComp;
                    })()
                    : new AgRadioButton(params)
            );

            this.addChangeListener(comp, col);
            this.groupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);

            if (supportsMultipleCategoryColumns) this.addDragHandle(comp, col);
        });

        if (supportsMultipleCategoryColumns) {
            const categoriesGroupGui = this.groupComp.getGui();
            
            const dropTarget: DropTarget = {
                getIconName: () => DragAndDropService.ICON_MOVE,
                getContainer: () => categoriesGroupGui,
                onDragging: (params) => this.onDragging(params),
                onDragLeave: () => this.onDragLeave(),
                isInterestedIn: this.isInterestedIn.bind(this),
                targetContainsSource: true
            };

            this.dragAndDropService.addDropTarget(dropTarget);
            this.addDestroyFunc(() => this.dragAndDropService.removeDropTarget(dropTarget));
        }
    }

    private getCategoryGroupTitle() {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    }

    protected destroy(): void {
        this.groupComp = this.destroyBean(this.groupComp)!;
        super.destroy();
    }
}
