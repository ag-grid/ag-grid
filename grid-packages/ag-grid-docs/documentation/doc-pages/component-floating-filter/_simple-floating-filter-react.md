[[only-react]]
|Below is an example of floating filter component as a Hook:
|
|```jsx
|export default forwardRef((props, ref) => {
|    const [currentValue, setCurrentValue] = useState(null);
|    const inputRef = useRef(null);
|
|    // expose AG Grid Filter Lifecycle callbacks
|    useImperativeHandle(ref, () => {
|        return {
|            onParentModelChanged(parentModel) {
|                // When the filter is empty we will receive a null value here
|                if (!parentModel) {
|                    inputRef.current.value = '';
|                    setCurrentValue(null);
|                } else {
|                    inputRef.current.value = parentModel.filter + '';
|                    setCurrentValue(parentModel.filter);
|                }
|            }
|
|        }
|    });
|
|
|    const onInputBoxChanged = input => {
|        if (input.target.value === '') {
|            // clear the filter
|            props.parentFilterInstance(instance => {
|                instance.onFloatingFilterChanged(null, null);
|            });
|            return;
|        }
|
|        setCurrentValue(Number(input.target.value));
|        props.parentFilterInstance(instance => {
|            instance.onFloatingFilterChanged('greaterThan', input.target.value);
|        });
|    }
|
|    const style = {
|        color: props.color,
|        width: "30px"
|    };
|
|    return (
|        <Fragment>
|            &gt; <input ref={inputRef} style={style} type="number" min="0" onInput={onInputBoxChanged}/>
|        </Fragment>
|    );
|});
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class NumberFloatingFilterComponent extends Component {
|    constructor(props) {
|        super(props);
|
|        this.state = {
|            currentValue: null
|        }
|
|        this.inputRef = createRef();
|    }
|
|    onParentModelChanged(parentModel) {
|        // When the filter is empty we will receive a null value here
|        if (!parentModel) {
|            this.inputRef.current.value = '';
|            this.setState({currentValue: null});
|        } else {
|            this.inputRef.current.value = parentModel.filter + '';
|            this.setState({currentValue: parentModel.filter});
|        }
|    }
|
|    onInputBoxChanged = input => {
|        if (input.target.value === '') {
|            // clear the filter
|            this.props.parentFilterInstance(instance => {
|                instance.onFloatingFilterChanged(null, null);
|            });
|            return;
|        }
|
|        this.setState({currentValue: Number(input.target.value)});
|        this.props.parentFilterInstance(instance => {
|            instance.onFloatingFilterChanged('greaterThan', input.target.value);
|        });
|    }
|
|    render() {
|        const style = {
|            color: this.props.color,
|            width: "30px"
|        };
|
|        return (
|            <Fragment>
|                &gt; <input ref={this.inputRef} style={style} type="number" min="0" onInput={this.onInputBoxChanged}/>
|            </Fragment>
|        );
|    }
|}
|```
