<framework-specific-section frameworks="javascript">
|The interface for the Cell Component is as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface ICellRendererComp {
|    // Optional - Params for rendering.
|    init?(params: ICellRendererParams): void;
|
|    // Mandatory - Return the DOM element of the component, this is what the grid puts into the cell
|    getGui(): HTMLElement;
|
|    // Optional - Gets called once by grid after rendering is finished - if your renderer needs to do any cleanup,
|    // do it here
|    destroy?(): void;
|
|    // Mandatory - Get the cell to refresh. Return true if the refresh succeeded, otherwise return false.
|    // If you return false, the grid will remove the component from the DOM and create
|    // a new component in its place with the new values.
|    refresh(params: ICellRendererParams): boolean;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
The `props` (interface ICellRendererParams) passed to the Cell Component are as follows:
</framework-specific-section>
