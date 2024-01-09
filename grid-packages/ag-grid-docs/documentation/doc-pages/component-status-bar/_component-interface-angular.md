<framework-specific-section frameworks="angular">
|Implement this interface to create a status bar component.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface IStatusPanelAngularComp {
|    // mandatory methods
|
|    // The agInit(params) method is called on the status bar component once.
|    // See below for details on the parameters.
|    agInit(params: IStatusPanelParams): void;
|
|    // optional methods
|
|    // Called when the `statusBar` grid option is updated.
|    // If this method returns `true`, the grid assumes that
|    // the status panel has updated with the latest params,
|    // and takes no further action. If this method returns `false`,
|    // or is not implemented, the grid will destroy and
|    // recreate the status panel.
|    refresh(params: IStatusPanelParams): boolean;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
