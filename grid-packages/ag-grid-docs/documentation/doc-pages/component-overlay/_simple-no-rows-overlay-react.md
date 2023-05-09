<framework-specific-section frameworks="react">
|Below is an example of a no rows overlay component with custom `noRowsMessageFunc()` params as a Hook:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default props => {
|    return (
|        &lt;div className="ag-overlay-loading-center" style={{backgroundColor: 'lightcoral', height: '9%'}}>
|            &lt;i className="far fa-frown"> {props.noRowsMessageFunc()}&lt;/i>
|        &lt;/div>
|    );
|};
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: CustomNoRowsOverlay,
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|And here is the same example as a Class-based Component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default class CustomNoRowsOverlay extends Component {
|    render() {
|        return (
|            &lt;div className="ag-overlay-loading-center" style={{backgroundColor: 'lightcoral', height: '9%'}}>
|                &lt;i className="far fa-frown"> {this.props.noRowsMessageFunc()}&lt;/i>
|            &lt;/div>
|        );
|    }
|}
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: CustomNoRowsOverlay,
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
</snippet>
</framework-specific-section>
