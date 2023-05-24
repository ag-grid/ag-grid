<framework-specific-section frameworks="react">
|Below is an example of overlay component with custom `loadingMessage`:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default props => {
|    return (
|        &lt;div className="ag-custom-loading-cell" style={{paddingLeft: '10px', lineHeight: '25px'}}>
|            &lt;i className="fas fa-spinner fa-pulse">&lt;/i> &lt;span> {props.loadingMessage}&lt;/span>
|        &lt;/div>
|    );
|};
|
|const gridOptions: GridOptions = {
|  ...
|  loadingOverlayComponent: CustomLoadingOverlay,
|  loadingOverlayComponentParams: {
|    loadingMessage: 'One moment please...',
|  },
|}
</snippet>
</framework-specific-section>
