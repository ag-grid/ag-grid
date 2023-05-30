<framework-specific-section frameworks="react">
|Below is an example of loading cell renderer component:
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
