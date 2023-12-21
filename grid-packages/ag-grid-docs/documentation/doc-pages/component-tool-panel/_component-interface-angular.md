<framework-specific-section frameworks="angular">
|Implement this interface to create a tool panel component.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface IToolPanelAngularComp {
|    /** The agInit(params) method is called on the tool panel component once.
|        See below for details on the parameters. */
|    agInit(params: IToolPanelParams): void;
|
|    /** Can be left blank if no custom refresh logic is required. */
|    refresh(): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>

