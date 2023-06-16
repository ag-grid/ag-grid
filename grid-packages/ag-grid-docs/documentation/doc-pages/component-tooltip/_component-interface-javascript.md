<framework-specific-section frameworks="javascript">
|## Tooltip Component Interface
|
|Implement this interface to provide a custom tooltip.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface ITooltipComp {
|    // The init(params) method is called on the tooltip component once. See below for details on the parameters.
|    init(params: ITooltipParams): void;
|
|    // Returns the DOM element for this tooltip
|    getGui(): HTMLElement;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
|The interface for the init parameters is as follows:
</framework-specific-section>



