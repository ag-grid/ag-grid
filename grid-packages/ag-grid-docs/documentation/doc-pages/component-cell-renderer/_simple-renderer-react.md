<framework-specific-section frameworks="react">
|Below is an example of cell renderer:
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
