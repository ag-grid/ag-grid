<framework-specific-section frameworks="vue">
<snippet transform={false} language="ts">
|interface IHeader {
|    // Gets called when a new Column Definition has been set for this header.
|    // If you handle the refresh of your header return true otherwise return false
|    // and the grid will re-create your header from scratch.
|    refresh(params: IHeaderParams): boolean;
|}
</snippet>
</framework-specific-section>
