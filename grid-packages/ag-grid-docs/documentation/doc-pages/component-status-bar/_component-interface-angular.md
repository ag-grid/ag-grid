<framework-specific-section frameworks="angular">
|## Status Bar Panel Interface
|
|Implement this interface to create a status bar component.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface IStatusPanelAngularComp {
|    /** The agInit(params) method is called on the status bar component once.
|        See below for details on the parameters. */
|    agInit(params: IStatusPanelParams): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>


