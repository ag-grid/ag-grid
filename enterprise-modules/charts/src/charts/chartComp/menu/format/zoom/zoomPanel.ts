import {
    AgGroupComponentParams,
    AgInputNumberField,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from '@ag-grid-community/core';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { FormatPanelOptions } from '../formatPanel';
import { ChartMenuUtils } from '../../chartMenuUtils';

export class ZoomPanel extends Component {
    public static TEMPLATE = /* html */ `<div>
            <ag-group-component ref="zoomGroup">
                <ag-checkbox ref="zoomAxisDraggingCheckbox"></ag-checkbox>
                <ag-checkbox ref="zoomScrollingCheckbox"></ag-checkbox>
                <ag-input-number-field ref="zoomScrollingStepInput"></ag-input-number-field>
                <ag-checkbox ref="zoomSelectingCheckbox"></ag-checkbox>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    @RefSelector('zoomScrollingStepInput') private readonly zoomScrollingStepInput: AgInputNumberField;

    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartMenuUtils, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartMenuUtils = chartMenuUtils;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const zoomGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>('zoom.enabled', {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('zoom'),
            suppressEnabledCheckbox: false,
            suppressToggleExpandOnEnableChange: true,
            expanded: this.isExpandedOnInit,
        });
        const zoomAxisDraggingCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams(
            'zoom.enableAxisDragging',
            'axisDragging'
        );
        const zoomScrollingCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams(
            'zoom.enableScrolling',
            'scrollingZoom'
        );
        const zoomScrollingStepInputParams = this.chartMenuUtils.getDefaultNumberInputParams(
            'zoom.scrollingStep',
            'scrollingStep',
            {
                step: 0.01,
                max: 1,
            }
        );
        const zoomSelectingCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams(
            'zoom.enableSelecting',
            'selectingZoom'
        );

        // Enable/disable the scrolling step input according to whether the scrolling checkbox is checked
        zoomScrollingCheckboxParams.onValueChange = ((onValueChange) => (value: any) => {
            if (!onValueChange) return;
            onValueChange(value);
            this.zoomScrollingStepInput.setDisabled(value);
        })(zoomScrollingCheckboxParams.onValueChange);

        this.setTemplate(ZoomPanel.TEMPLATE, {
            zoomGroup: zoomGroupParams,
            zoomAxisDraggingCheckbox: zoomAxisDraggingCheckboxParams,
            zoomScrollingCheckbox: zoomScrollingCheckboxParams,
            zoomScrollingStepInput: zoomScrollingStepInputParams,
            zoomSelectingCheckbox: zoomSelectingCheckboxParams,
        });

        // Set the initial state of the scrolling step input according to whether the scrolling checkbox is checked
        this.zoomScrollingStepInput.setDisabled(!zoomScrollingCheckboxParams.value);
    }
}
