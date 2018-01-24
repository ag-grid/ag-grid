import React, {Component} from "react";

export default class FloatingFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parentModel: null
        }
    }

    // when does this get called? how to test this?
    onParentModelChanged(parentModel) {
        this.setState({
            parentModel: parentModel
        })
    }

    remove(item) {
        this.props.onFloatingFilterChanged({
            model: this.state.parentModel.filter(it => it !== item)
        });
    }

    render() {
        if (!this.state.parentModel) return null;

        // as the backing filter is a set filter what we're doing here is rendering the list in the set
        // and when the [x] removing the selected item, thereby effectively hiding it
        let options = this.state.parentModel.map((item, i) => {
            let removeMeListener = () => {
                this.remove(item)
            };
            let removeMeElement = <a onClick={removeMeListener}>[x]</a>;
            return <span key={i}>{item}{removeMeElement}</span>;
        });

        return <div>{options}</div>;
    }
}