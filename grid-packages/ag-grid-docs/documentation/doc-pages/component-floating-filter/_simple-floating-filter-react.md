<framework-specific-section frameworks="react">
|Below is an example of floating filter component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
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
|        &lt;Fragment>
|            &gt; &lt;input ref={inputRef} style={style} type="number" min="0" onInput={onInputBoxChanged}/>
|        &lt;/Fragment>
|    );
|});
</snippet>
</framework-specific-section>
