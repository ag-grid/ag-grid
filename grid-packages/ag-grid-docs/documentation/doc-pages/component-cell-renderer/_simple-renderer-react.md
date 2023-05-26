<framework-specific-section frameworks="react">
|Below is an example of cell renderer:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default props => {
|    const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
|
|    const buttonClicked = () => {
|        alert(`${cellValue} medals won!`)
|    }
|
|    return (
|        &lt;span>
|           &lt;span>{cellValue}&lt;/span>&nbsp;
|           &lt;button onClick={() => buttonClicked()}>Push For Total&lt;/button>
|        &lt;/span>
|    );
|}
</snippet>
</framework-specific-section>
