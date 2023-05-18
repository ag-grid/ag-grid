<framework-specific-section frameworks="react">
|Below is a simple example of loading cell renderer component as a Hook:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default props => {
|    return (
|        &lt;div className="ag-overlay-loading-center" style={{backgroundColor: 'lightsteelblue', height: '9%'}}>
|            &lt;i className="fas fa-hourglass-half"> {props.loadingMessage} &lt;/i>
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|And here is the same example as a Class-based Component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default class CustomLoadingCellRenderer extends Component {
|    render() {
|        return (
|            &lt;div className="ag-custom-loading-cell" style={{paddingLeft: '10px', lineHeight: '25px'}}>
|                &lt;i className="fas fa-spinner fa-pulse">&lt;/i> &lt;span> {this.props.loadingMessage}&lt;/span>
|            &lt;/div>
|        );
|    }
|}
</snippet>
</framework-specific-section>