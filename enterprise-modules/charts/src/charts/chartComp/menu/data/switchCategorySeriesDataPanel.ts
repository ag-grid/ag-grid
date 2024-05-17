import {
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
} from '@ag-grid-community/core';
import { AgGroupComponentParams } from "@ag-grid-enterprise/core";
import { ChartTranslationService } from '../../services/chartTranslationService';

export class SwitchCategorySeriesDataPanel extends Component {
    private static TEMPLATE = /* html */ `<div>
        <ag-group-component ref="switchCategorySeriesGroup"></ag-group-component>
    </div>`;

    @Autowired('chartTranslationService') protected readonly chartTranslationService: ChartTranslationService;

    private switchCategorySeriesToggleButton?: AgToggleButton;

    constructor(
        private readonly getValue: () => boolean,
        private readonly setValue: (value: boolean) => void,
    ) {
        super();
    }

    @PostConstruct
    private init() {
        this.switchCategorySeriesToggleButton = this.createManagedBean(new AgToggleButton({
            label: this.chartTranslationService.translate('switchCategorySeries'),
            labelAlignment: 'left',
            labelWidth: "flex",
            inputWidth: 'flex',
            value: this.getValue(),
            onValueChange: (value) => {
                this.setValue(value);
            },
        }));

        const switchCategorySeriesGroupParams: AgGroupComponentParams = {
            title: undefined,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: true,
            cssIdentifier: 'charts-data',
            expanded: true,
            items: [this.switchCategorySeriesToggleButton],
        };

        this.setTemplate(SwitchCategorySeriesDataPanel.TEMPLATE, [/** Shared via GridChartsModule.agStackComponents */], {
            switchCategorySeriesGroup: switchCategorySeriesGroupParams,
        });
    }

    public refresh(): void {
        this.switchCategorySeriesToggleButton?.setValue(this.getValue(), true);
    }
}
