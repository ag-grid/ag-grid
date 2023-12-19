<framework-specific-section frameworks="angular">
|The interface for the loading cell renderer component is as follows:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface ILoadingCellRendererAngularComp {
|
|    // Mandatory - The agInit(params) method is called on the loading cell renderer once.
|    agInit(params: ILoadingCellRendererParams): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>

