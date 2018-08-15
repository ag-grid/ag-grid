import React, {Component} from "react";

export default class ClickableStatusBarComponent extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        alert('Selected Row Count: ' + this.props.api.getSelectedRows().length)
    }

    render() {
        const containerStyle = {
            marginRight: 5,
            backgroundColor: 'lightgrey',
            paddingLeft: 5,
            paddingRight: 5,
            borderRadius: 5
        }

        const componentStyle = {
            marginLeft: 5,
            paddingTop: 0,
            paddingBottom: 0
        }

        return (
            <div style={containerStyle}>
                <span style={componentStyle}>Status Bar Component&nbsp;
                    <input type="button" onClick={this.onClick} value="Click Me"/>
                </span>
            </div>
        );
    }
};
