import React, {Component} from "react";

export default class ClickableStatusBarComponent extends Component {
    onClick = () =>  {
        alert('Selected Row Count: ' + this.props.api.getSelectedRows().length)
    }

    render() {
        const style = {
            padding: 5,
            margin: 5
        }
        return <input style={style} type="button" onClick={this.onClick} value="Click Me For Selected Row Count"/>;
    }
};
