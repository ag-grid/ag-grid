<framework-specific-section frameworks="angular">
|Implement this interface to create a tooltip component.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface ITooltipAngularComp {
|    // The agInit(params) method is called on the tooltip component once.
|    // See below for details on the parameters.
|    agInit(params: ITooltipParams): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
