<framework-specific-section frameworks="react">
|
|Below is an example of a tooltip component:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default props => {
|    const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex).data, []);
|    return (
|        &lt;div className="custom-tooltip" style={{backgroundColor: props.color || 'white'}}>
|            &lt;p>&lt;span>{data.athlete}&lt;/span>&lt;/p>
|            &lt;p>&lt;span>Country: &lt;/span> {data.country}&lt;/p>
|            &lt;p>&lt;span>Total: &lt;/span> {data.total}&lt;/p>
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>
