[[only-react]]
|
|Below is a simple example of a tooltip component as a Hook:
|
|```jsx
|export default forwardRef((props, ref) => {
|    const [data, setData] = useState(props.api.getDisplayedRowAtIndex(props.rowIndex).data);
|
|    useImperativeHandle(ref, () => {
|        return {
|            getReactContainerClasses() {
|                return ['custom-tooltip'];
|            }
|        }
|    });
|
|    return (
|        <div className="custom-tooltip" style={{backgroundColor: props.color || 'white'}}>
|            <p><span>{data.athlete}</span></p>
|            <p><span>Country: </span> {data.country}</p>
|            <p><span>Total: </span> {data.total}</p>
|        </div>
|    );
|});
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomTooltip extends Component {
|    getReactContainerClasses() {
|        return ['custom-tooltip'];
|    }
|
|    render() {
|        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
|        return (
|            <div className="custom-tooltip" style={{backgroundColor: this.props.color || 'white'}}>
|                <p><span>{data.athlete}</span></p>
|                <p><span>Country: </span> {data.country}</p>
|                <p><span>Total: </span> {data.total}</p>
|            </div>
|        );
|    }
|}
|```
