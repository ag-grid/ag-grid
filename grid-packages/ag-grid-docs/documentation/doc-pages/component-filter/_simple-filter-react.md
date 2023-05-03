<framework-specific-section frameworks="react">
|Below is a simple example of filter component as a Hook:
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
|        &lt;div style={{display: "inline-block", width: "400px"}} onChange={onYearChange}>
|            &lt;div style={{padding: "10px", backgroundColor: "#d3d3d3", textAlign: "center"}}>This is a very wide filter&lt;/div>
|            &lt;label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
|                &lt;input type="radio" name="year" value="All" checked={year === 'All'}/> All
|            &lt;/label>
|            &lt;label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
|                &lt;input type="radio" name="year" value="2010"/> Since 2010
|            &lt;/label>
|        &lt;/div>
|    )
|});
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|And here is the same example as a Class-based Component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default class YearFilter extends Component {
|    constructor(props) {
|        super(props);
|
|        this.state = {
|            year: "All"
|        }
|    }
|
|    doesFilterPass(params) {
|        return params.data.year >= 2010;
|    }
|
|    isFilterActive() {
|        return this.state.year === '2010'
|    }
|
|    // this example isn't using getModel() and setModel(),
|    // so safe to just leave these empty. don't do this in your code!!!
|    getModel() {
|    }
|
|    setModel() {
|    }
|
|    onYearChange(event) {
|        this.setState({year: event.target.value},
|            () => this.props.filterChangedCallback()
|        );
|    }
|
|    render() {
|        return (
|            &lt;div style={{display: "inline-block", width: "400px"}} onChange={this.onYearChange.bind(this)}>
|                &lt;div style={{padding: "10px", backgroundColor: "#d3d3d3", textAlign: "center"}}>This is a very wide filter&lt;/div>
|                &lt;label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
|                    &lt;input type="radio" name="year" value="All" checked={this.state.year === 'All'}/> All
|                &lt;/label>
|                &lt;label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
|                    &lt;input type="radio" name="year" value="2010" /> Since 2010
|                &lt;/label>
|            &lt;/div>
|        );
|    }
|}
</snippet>
</framework-specific-section>