<framework-specific-section frameworks="react">
|Below is a simple example of cell renderer as a Hook:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|export default props => {
|    const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
|
|    const buttonClicked = () => {
|        alert(`${cellValue} medals won!`)
|    }
|
|    return (
|        <span>
|           <span>{cellValue}</span>&nbsp;
|           <button onClick={() => buttonClicked()}>Push For Total</button>
|        </span>
|    );
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|And here is the same example as a Class-based Component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default class TotalValueRenderer extends Component {
|    constructor(props) {
|        super(props);
|
|        this.state = {
|            cellValue: TotalValueRenderer.getValueToDisplay(props)
|        }
|    }
|
|    // update cellValue when the cell's props are updated
|    static getDerivedStateFromProps(nextProps) {
|        return {
|            cellValue: TotalValueRenderer.getValueToDisplay(nextProps)
|        };
|    }
|
|    buttonClicked() {
|        alert(`${this.state.cellValue} medals won!`)
|    }
|
|    render() {
|        return (
|            <span>
|              <span>{this.state.cellValue}</span>&nbsp;
|              <button onClick={() => this.buttonClicked()}>Push For Total</button>
|            </span>
|        );
|    }
|
|    static getValueToDisplay(params) {
|        return params.valueFormatted ? params.valueFormatted : params.value;
|    }
|};
</snippet>
</framework-specific-section>
