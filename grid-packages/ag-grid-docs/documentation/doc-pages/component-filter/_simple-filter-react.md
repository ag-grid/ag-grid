<framework-specific-section frameworks="react">
|Below is an example of filter component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default forwardRef((props, ref) => {
|    const [year, setYear] = useState('All');
|
|    // expose AG Grid Filter Lifecycle callbacks
|    useImperativeHandle(ref, () => {
|        return {
|            doesFilterPass(params) {
|                return params.data.year >= 2010;
|            },
|
|            isFilterActive() {
|                return year === '2010'
|            },
|
|            // this example isn't using getModel() and setModel(),
|            // so safe to just leave these empty. don't do this in your code!!!
|            getModel() {
|            },
|
|            setModel() {
|            }
|        }
|    });
|
|    const onYearChange = event => {
|        setYear(event.target.value)
|    }
|
|    useEffect(() => {
|        props.filterChangedCallback()
|    }, [year]);
|
|    return (
|        &lt;div onChange={onYearChange}>
|            &lt;div>Select Year Range&lt;/div>
|            &lt;label>
|                &lt;input type="radio" name="year" value="All" checked={year === 'All'}/> All
|            &lt;/label>
|            &lt;label>
|                &lt;input type="radio" name="year" value="2010"/> Since 2010
|            &lt;/label>
|        &lt;/div>
|    )
|});
</snippet>
</framework-specific-section>
