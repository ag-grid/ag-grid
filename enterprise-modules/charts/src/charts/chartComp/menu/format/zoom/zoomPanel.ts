import {
    AgEventListener,
    AgGroupComponent,
    AgGroupComponentParams,
    AgInputNumberField,
    Autowired,
    ChartOptionsChanged,
    Component,
    Events,
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

    @RefSelector('zoomGroup') private readonly zoomGroup: AgGroupComponent;
    @RefSelector('zoomScrollingStepInput') private readonly zoomScrollingStepInput: AgInputNumberField;

    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly isExpandedOnInit: boolean;
    private isToggling: boolean = false;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartMenuUtils = chartOptionsService.getChartOptionMenuUtils();
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

        // Disable the navigator setting whenever the zoom setting is enabled
        zoomGroupParams.onEnableChange = ((onEnableChange) => (enabled: boolean) => {
            if (!onEnableChange) return;
            this.isToggling = true;
            if (enabled) this.chartMenuUtils.setValue('navigator.enabled', false);
            onEnableChange(enabled);
            this.isToggling = false;
        })(zoomGroupParams.onEnableChange);

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

        // Ensure up-to-date panel enabled state whenever the chart options are changed from elsewhere
        // (this is necessary because enabling the navigator setting causes the panel to become disabled)
        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, (event: ChartOptionsChanged) => {
            if (this.isToggling) return; // Ignore internal changes to the panel enabled state
            const enabled = this.chartMenuUtils.getValue<boolean>('zoom.enabled');
            const panelIsEnabled = this.zoomGroup.isEnabled();
            if (panelIsEnabled !== enabled) this.zoomGroup.setEnabled(enabled);
        });
    }
}
