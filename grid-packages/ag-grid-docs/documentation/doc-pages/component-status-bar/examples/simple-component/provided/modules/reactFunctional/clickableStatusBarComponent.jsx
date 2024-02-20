import React from 'react';

export default props => {
    const onClick = () => {
        alert('Selected Row Count: ' + props.api.getSelectedRows().length)
    }

    const style = {
        padding: 5,
        margin: 5
    }

    return <input style={style} type="button" onClick={onClick} value="Click Me For Selected Row Count"/>;
};

