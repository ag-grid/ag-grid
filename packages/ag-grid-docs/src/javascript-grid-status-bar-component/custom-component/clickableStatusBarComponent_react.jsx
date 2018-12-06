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
};
