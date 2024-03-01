import {
    AgCheckbox,
    AgCheckboxParams,
    AgGroupComponent,
    AgRadioButton,
    AgSelect,
    AutoScrollService,
    Autowired,
    DragAndDropService,
    DropTarget,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { AgPillSelect } from "../../../../widgets/agPillSelect";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartTranslationService } from "../../services/chartTranslationService";
import { isHierarchical } from "../../utils/seriesTypeMapper";
import { DragDataPanel } from "./dragDataPanel";

export class CategoriesDataPanel extends DragDataPanel {
    // can't wire group comp unless done in a major version
    private static TEMPLATE = /* html */`<div id="categoriesGroup"></div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private categoriesGroupComp: AgGroupComponent;

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
        this.categoriesGroupComp = this.createBean(new AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen
        }));
        if (this.gridOptionsService.get('legacyChartsMenu')) {
            this.createLegacyCategoriesGroup(this.dimensionCols);
        } else {
            this.createCategoriesGroup(this.dimensionCols);
        }
        this.getGui().appendChild(this.categoriesGroupComp.getGui());
    }

    public refresh(dimensionCols: ColState[]): void {
        if (this.gridOptionsService.get('legacyChartsMenu')) {
            if (!this.refreshColumnComps(dimensionCols)) {
                this.recreate(dimensionCols);
            }
        } else {
            // TODO non-legacy
        }
    }

    private recreate(dimensionCols: ColState[]): void {
        this.isOpen = this.categoriesGroupComp.isExpanded();
        _.clearElement(this.getGui());
        this.destroyBean(this.categoriesGroupComp);
        this.dimensionCols = dimensionCols;
        this.init();
    }

    private createCategoriesGroup(columns: ColState[]): void {
        const chartType = this.chartController.getChartType();
        const supportsMultipleCategoryColumns = isHierarchical(chartType);

        if (supportsMultipleCategoryColumns) {
            const selectedValueList = columns.filter(col => col.selected);
            const comp = this.categoriesGroupComp.createManagedBean(new AgPillSelect<ColState>({
                valueList: columns,
                selectedValueList,
                valueFormatter: (col) => _.escapeString(col?.displayName)!,
                selectPlaceholder: this.chartTranslationService.translate('categoryAdd'),
                dragSourceId: 'categorySelect',
                onValuesChange: params => this.onValueChange(params)
            }));
            this.categoriesGroupComp.addItem(comp);
        } else {
            let selectedValue: ColState;
            const options = columns.map(value => {
                const text = _.escapeString(value.displayName)!;
                if (value.selected) {
                    selectedValue = value;
                }
                return {
                    value,
                    text
                }
            });
            const onValueChange = (newValue: ColState) => {
                columns.forEach(col => {
                    col.selected = false;
                });
                newValue.selected = true;
                this.chartController.updateForPanelChange(newValue);
            };
            const comp = this.categoriesGroupComp.createManagedBean(new AgSelect<ColState>({
                options,
                value: selectedValue!,
                onValueChange
            }));
            this.categoriesGroupComp.addItem(comp);
        }
    }

    private createLegacyCategoriesGroup(columns: ColState[]): void {
        const inputName = `chartDimension${this.categoriesGroupComp.getCompId()}`;

        // Display either radio buttons or checkboxes
        // depending on whether the current chart type supports multiple category columns
        const chartType = this.chartController.getChartType();
        const supportsMultipleCategoryColumns = isHierarchical(chartType);

        columns.forEach(col => {
            const params: AgCheckboxParams = {
                label: _.escapeString(col.displayName)!,
                value: col.selected,
                inputName
            };
            const comp: AgCheckbox | AgRadioButton = this.categoriesGroupComp!.createManagedBean(
                supportsMultipleCategoryColumns
                    ? (() => {
                        const checkboxComp = new AgCheckbox(params);
                        checkboxComp.addCssClass('ag-data-select-checkbox');
                        return checkboxComp;
                    })()
                    : new AgRadioButton(params)
            );

            this.addChangeListener(comp, col);
            this.categoriesGroupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);

            if (supportsMultipleCategoryColumns) this.addDragHandle(comp, col);
        });

        if (supportsMultipleCategoryColumns) {
            const categoriesGroupGui = this.categoriesGroupComp.getGui();
            
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
        this.categoriesGroupComp = this.destroyBean(this.categoriesGroupComp)!;
        super.destroy();
    }
}
