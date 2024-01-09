<framework-specific-section frameworks="angular">
|Implement this interface to create a tool panel component.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface IToolPanelAngularComp {
|    // mandatory methods
|
|    // The agInit(params) method is called on the tool panel component once.
|    // See below for details on the parameters.
|    agInit(params: IToolPanelParams): void;
|
|    // optional methods
|
|    // Called when `api.refreshToolPanel()` is called (with the current params).
|    // Also called when the `sideBar` grid option is updated (with the updated params).
|    // When `sideBar` is updated, if this method returns `true`,
|    // then the grid will take no further action.
|    // Otherwise, the tool panel will be destroyed and recreated.
|    refresh(params: IToolPanelParams): boolean | void;
|
|    // If saving and restoring state, this should return the current state
|    getState(): any;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>

