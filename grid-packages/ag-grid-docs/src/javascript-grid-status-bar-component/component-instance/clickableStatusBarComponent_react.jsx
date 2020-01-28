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
        if (this.state.visible) {
            return (
                <div className="container">
                    <div>
                    <span className="component">Status Bar Component&nbsp;
                        <input type="button" onClick={this.onClick} value="Click Me"/>
                    </span>
                    </div>
                </div>
            );
        }

        return null;
    }
};
