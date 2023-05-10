[[only-react]]
|Below is a simple example of filter component as a Hook:
|
|```jsx
|export default forwardRef((props, ref) => {
|    const [date, setDate] = useState(null);
|    const [picker, setPicker] = useState(null);
|    const refFlatPickr = useRef();
|    const refInput = useRef();
|
|    // we use a ref as well as state, as state is async,
|    // and after the grid calls setDate() (eg when setting filter model)
|    // it then can call getDate() immediately (eg to execute the filter)
|    // and we need to pass back the most recent value, not the old 'current state'.
|    const dateRef = useRef();
|
|    //*********************************************************************************
|    //          LINKING THE UI, THE STATE AND AG-GRID
|    //*********************************************************************************
|
|    const onDateChanged = (selectedDates) => {
|        const newDate = selectedDates[0];
|        setDate(newDate);
|        dateRef.current = newDate;
|        props.onDateChanged();
|    };
|
|    useEffect(() => {
|        setPicker(flatpickr(refFlatPickr.current, {
|            onChange: onDateChanged,
|            dateFormat: 'd/m/Y',
|            wrap: true
|        }));
|    }, []);
|
|    useEffect(() => {
|        if (picker) {
|            picker.calendarContainer.classList.add('ag-custom-component-popup');
|        }
|    }, [picker]);
|
|    useEffect(() => {
|        //Callback after the state is set. This is where we tell ag-grid that the date has changed so
|        //it will proceed with the filtering and we can then expect AG Grid to call us back to getDate
|        if (picker) {
|            picker.setDate(date);
|        }
|    }, [date, picker]);
|
|    useImperativeHandle(ref, () => ({
|        //*********************************************************************************
|        //          METHODS REQUIRED BY AG-GRID
|        //*********************************************************************************
|        getDate() {
|            //ag-grid will call us here when in need to check what the current date value is hold by this
|            //component.
|            return dateRef.current;
|        },
|
|        setDate(date) {
|            //ag-grid will call us here when it needs this component to update the date that it holds.
|            dateRef.current = date;
|            setDate(date);
|        },
|
|        //*********************************************************************************
|        //          AG-GRID OPTIONAL METHODS
|        //*********************************************************************************
|
|        setInputPlaceholder(placeholder) {
|            if (refInput.current) {
|                refInput.current.setAttribute('placeholder', placeholder);
|            }
|        },
|
|        setInputAriaLabel(label) {
|            if (refInput.current) {
|                refInput.current.setAttribute('aria-label', label);
|            }
|        }
|    }));
|
|    // inlining styles to make simpler the component
|    return (
|        <div className="ag-input-wrapper custom-date-filter" role="presentation" ref={refFlatPickr}>
|            <input type="text" ref={refInput} data-input style={{ width: "100%" }} />
|            <a class='input-button' title='clear' data-clear>
|                <i class='fa fa-times'></i>
|            </a>
|        </div>
|    );
|});
|```
|
| Note that the grid calls `getDate` and `setDate` synchronously. As state is asynchronous, you will also need to use a ref if using state to store the current date value. This is demonstrated in the example above.
|
| Here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomDateComponent extends Component {
|    constructor(props) {
|        super(props);
|
|        this.state = {
|            date: null
|        };
|    }
|
|    render() {
|        //Inlining styles to make simpler the component
|        return (
|            <div className="ag-input-wrapper custom-date-filter" role="presentation" ref="flatpickr">
|                <input type="text" ref="eInput" data-input style={{width: "100%"}}/>
|                <a class='input-button' title='clear' data-clear>
|                    <i class='fa fa-times'></i>
|                </a>
|            </div>
|        );
|    }
|
|    componentDidMount() {
|        this.picker = flatpickr(this.refs.flatpickr, {
|            onChange: this.onDateChanged.bind(this),
|            dateFormat: 'd/m/Y',
|            wrap: true
|        });
|
|        this.eInput = this.refs.eInput;
|
|        this.picker.calendarContainer.classList.add('ag-custom-component-popup');
|    }
|
|    //*********************************************************************************
|    //          METHODS REQUIRED BY AG-GRID
|    //*********************************************************************************
|
|    getDate() {
|        //ag-grid will call us here when in need to check what the current date value is hold by this
|        //component.
|        return this.state.date;
|    }
|
|    setDate(date) {
|        //ag-grid will call us here when it needs this component to update the date that it holds.
|        this.setState({date});
|        this.picker.setDate(date);
|    }
|
|    //*********************************************************************************
|    //          AG-GRID OPTIONAL METHODS
|    //*********************************************************************************
|
|    setInputPlaceholder(placeholder) {
|        this.eInput.setAttribute('placeholder', placeholder);
|    }
|
|    setInputAriaLabel(label) {
|        this.eInput.setAttribute('aria-label', label);
|    }
|
|    //*********************************************************************************
|    //          LINKS THE INTERNAL STATE AND AG-GRID
|    //*********************************************************************************
|
|    updateAndNotifyAgGrid(date) {
|        //Callback after the state is set. This is where we tell ag-grid that the date has changed so
|        //it will proceed with the filtering and we can then expect AG Grid to call us back to getDate
|        this.setState({date}, this.props.onDateChanged);
|    }
|
|    //*********************************************************************************
|    //          LINKING THE UI, THE STATE AND AG-GRID
|    //*********************************************************************************
|
|    onDateChanged = (selectedDates) => {
|        this.setState({date: selectedDates[0]});
|        this.updateAndNotifyAgGrid(selectedDates[0]);
|    };
|}
|```

