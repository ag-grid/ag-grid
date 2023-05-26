<framework-specific-section frameworks="react">
|Below is an example of a status bar component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import React from 'react';
|
|export default props => {
|    const onClick = () => {
|        alert('Selected Row Count: ' + props.api.getSelectedRows().length)
|    }
|
|    const style = {
|        padding: 5,
|        margin: 5
|    }
|
|    return &lt;input style={style} type="button" onClick={onClick} value="Click Me For Selected Row Count"/>;
|};
</snippet>
</framework-specific-section>
