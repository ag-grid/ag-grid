import React, {Component} from "react";

export default class ClickableStatusBarComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: true
        };

        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        alert('Selected Row Count: ' + this.props.api.getSelectedRows().length)
    }

    setVisible(visible) {
        this.setState({visible})
    }

    isVisible() {
        return this.state.visible;
    }

    render() {
        const containerStyle = {
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            margin: 5,
            backgroundColor: 'lightgrey',
            padding: '3px 5px 3px 5px',
            borderRadius: 5
        };

        const componentStyle = {
            marginLeft: 5,
            paddingTop: 0,
            paddingBottom: 0
        };

        if (this.state.visible) {
            return (
                <div style={containerStyle}>
                    <div>
                    <span style={componentStyle}>Status Bar Component&nbsp;
                        <input type="button" onClick={this.onClick} value="Click Me"/>
                    </span>
                    </div>
                </div>);
        }

        return null;
    }
};
