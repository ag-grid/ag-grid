import {
    AgGroupComponentParams,
    AgSlider,
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
                <ag-slider ref="zoomScrollingStepInput"></ag-slider>
                <ag-checkbox ref="zoomSelectingCheckbox"></ag-checkbox>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    @RefSelector('zoomScrollingStepInput') private readonly zoomScrollingStepInput: AgSlider;

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
        const zoomScrollingStepSliderParams = this.chartMenuUtils.getDefaultSliderParams(
            'zoom.scrollingStep',
            'scrollingStep',
            1,
        );
        zoomScrollingStepSliderParams.step = 0.01;
        zoomScrollingStepSliderParams.minValue = zoomScrollingStepSliderParams.step;
        const zoomSelectingCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams(
            'zoom.enableSelecting',
            'selectingZoom'
        );

        // Enable/disable the scrolling step input according to whether the scrolling checkbox is checked
        zoomScrollingCheckboxParams.onValueChange = ((onValueChange) => (value: boolean) => {
            if (!onValueChange) return;
            onValueChange(value);
            this.zoomScrollingStepInput.setDisabled(!value);
        })(zoomScrollingCheckboxParams.onValueChange);

        this.setTemplate(ZoomPanel.TEMPLATE, {
            zoomGroup: zoomGroupParams,
            zoomAxisDraggingCheckbox: zoomAxisDraggingCheckboxParams,
            zoomScrollingCheckbox: zoomScrollingCheckboxParams,
            zoomScrollingStepInput: zoomScrollingStepSliderParams,
            zoomSelectingCheckbox: zoomSelectingCheckboxParams,
        });

        // Set the initial state of the scrolling step input according to whether the scrolling checkbox is checked
        this.zoomScrollingStepInput.setDisabled(!zoomScrollingCheckboxParams.value);
    }
}
