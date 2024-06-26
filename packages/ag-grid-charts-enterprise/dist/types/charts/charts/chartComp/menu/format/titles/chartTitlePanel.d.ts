import type { AgInputTextFieldParams, BeanCollection } from 'ag-grid-community';
import type { AgSliderParams } from '../../../../../widgets/agSlider';
import { TitlePanel } from './titlePanel';
export declare class ChartTitlePanel extends TitlePanel {
    private chartMenuService;
    wireBeans(beans: BeanCollection): void;
    private titlePlaceholder;
    postConstruct(): void;
    protected getTextInputParams(): AgInputTextFieldParams;
    protected getSpacingSliderParams(): AgSliderParams;
    protected onEnableChange(enabled: boolean): void;
    private shouldOverrideTextWithPlaceholder;
}
