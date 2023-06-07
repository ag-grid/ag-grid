var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
export class TitleEdit extends Component {
    constructor(chartMenu) {
        super(TitleEdit.TEMPLATE);
        this.chartMenu = chartMenu;
        this.destroyableChartListeners = [];
        this.editing = false;
    }
    init() {
        this.addManagedListener(this.getGui(), 'keydown', (e) => {
            if (this.editing && e.key === 'Enter' && !e.shiftKey) {
                this.handleEndEditing();
                e.preventDefault();
            }
        });
        this.addManagedListener(this.getGui(), 'input', () => {
            if (this.editing) {
                this.updateHeight();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', () => this.endEditing());
    }
    /* should be called when the containing component changes to a new chart proxy */
    refreshTitle(chartController, chartOptionsService) {
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        for (const destroyFn of this.destroyableChartListeners) {
            destroyFn();
        }
        this.destroyableChartListeners = [];
        const chartProxy = this.chartController.getChartProxy();
        const chart = chartProxy.getChart();
        const canvas = chart.scene.canvas.element;
        const destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', event => {
            const { title } = chart;
            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                const bbox = title.node.computeBBox();
                const xy = title.node.inverseTransformPoint(bbox.x, bbox.y);
                this.startEditing(Object.assign(Object.assign({}, bbox), xy), canvas.width);
            }
        });
        let wasInTitle = false;
        const destroyMouseMoveListener = this.addManagedListener(canvas, 'mousemove', event => {
            const { title } = chart;
            const inTitle = !!(title && title.enabled && title.node.containsPoint(event.offsetX, event.offsetY));
            if (wasInTitle !== inTitle) {
                canvas.style.cursor = inTitle ? 'pointer' : '';
            }
            wasInTitle = inTitle;
        });
        this.destroyableChartListeners = [
            destroyDbleClickListener,
            destroyMouseMoveListener
        ];
    }
    startEditing(titleBBox, canvasWidth) {
        if (this.chartMenu && this.chartMenu.isVisible()) {
            // currently, we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }
        if (this.editing) {
            return;
        }
        this.editing = true;
        const minimumTargetInputWidth = 300;
        const inputWidth = Math.max(Math.min(titleBBox.width + 20, canvasWidth), minimumTargetInputWidth);
        const element = this.getGui();
        element.classList.add('currently-editing');
        const inputStyle = element.style;
        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartOptionsService.getChartOption('title.fontFamily');
        inputStyle.fontWeight = this.chartOptionsService.getChartOption('title.fontWeight');
        inputStyle.fontStyle = this.chartOptionsService.getChartOption('title.fontStyle');
        inputStyle.fontSize = this.chartOptionsService.getChartOption('title.fontSize') + 'px';
        inputStyle.color = this.chartOptionsService.getChartOption('title.color');
        // populate the input with the title, unless the title is the placeholder:
        const oldTitle = this.chartOptionsService.getChartOption('title.text');
        const isTitlePlaceholder = oldTitle === this.chartTranslationService.translate('titlePlaceholder');
        element.value = isTitlePlaceholder ? '' : oldTitle;
        const oldTitleLines = oldTitle.split(/\r?\n/g).length;
        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2 - 1) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - (oldTitleLines * this.getLineHeight()) / 2 - 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';
        inputStyle.lineHeight = this.getLineHeight() + 'px';
        this.updateHeight();
        element.focus();
    }
    updateHeight() {
        const element = this.getGui();
        // The element should cover the title and provide enough space for the new one.
        const oldTitleLines = this.chartOptionsService.getChartOption('title.text').split(/\r?\n/g).length;
        const currentTitleLines = element.value.split(/\r?\n/g).length;
        element.style.height = (Math.round(Math.max(oldTitleLines, currentTitleLines) * this.getLineHeight()) + 4) + 'px';
    }
    getLineHeight() {
        const fixedLineHeight = this.chartOptionsService.getChartOption('title.lineHeight');
        if (fixedLineHeight) {
            return parseInt(fixedLineHeight);
        }
        return Math.round(parseInt(this.chartOptionsService.getChartOption('title.fontSize')) * 1.2);
    }
    handleEndEditing() {
        // special handling to avoid flicker caused by delay when swapping old and new titles
        // 1 - store current title color
        const titleColor = this.chartOptionsService.getChartOption('title.color');
        // 2 - hide title by making it transparent
        const transparentColor = 'rgba(0, 0, 0, 0)';
        this.chartOptionsService.setChartOption('title.color', transparentColor);
        // 3 - trigger 'end editing' - this will update the chart with the new title
        this.chartOptionsService.awaitChartOptionUpdate(() => this.endEditing());
        // 4 - restore title color to its original value
        this.chartOptionsService.awaitChartOptionUpdate(() => {
            this.chartOptionsService.setChartOption('title.color', titleColor);
        });
    }
    endEditing() {
        if (!this.editing) {
            return;
        }
        this.editing = false;
        const value = this.getGui().value;
        if (value && value.trim() !== '') {
            this.chartOptionsService.setChartOption('title.text', value);
            this.chartOptionsService.setChartOption('title.enabled', true);
        }
        else {
            this.chartOptionsService.setChartOption('title.text', '');
            this.chartOptionsService.setChartOption('title.enabled', false);
        }
        this.getGui().classList.remove('currently-editing');
        // await chart updates so `chartTitleEdit` event consumers can read the new state correctly
        this.chartOptionsService.awaitChartOptionUpdate(() => {
            this.eventService.dispatchEvent({ type: 'chartTitleEdit' });
        });
    }
}
TitleEdit.TEMPLATE = `<textarea
             class="ag-chart-title-edit"
             style="padding:0; border:none; border-radius: 0; min-height: 0; text-align: center; resize: none;" />
        `;
__decorate([
    Autowired('chartTranslationService')
], TitleEdit.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], TitleEdit.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGVFZGl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvY2hhcnRUaXRsZS90aXRsZUVkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFROUUsTUFBTSxPQUFPLFNBQVUsU0FBUSxTQUFTO0lBY3BDLFlBQTZCLFNBQW9CO1FBQzdDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFERCxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBTHpDLDhCQUF5QixHQUFtQixFQUFFLENBQUM7UUFHL0MsWUFBTyxHQUFZLEtBQUssQ0FBQztJQUlqQyxDQUFDO0lBR00sSUFBSTtRQUNQLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBZ0IsRUFBRSxFQUFFO1lBQ25FLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDdEI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUNqRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3ZCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVB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