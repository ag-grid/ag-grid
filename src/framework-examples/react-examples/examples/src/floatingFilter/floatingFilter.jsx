import React, {Component} from "react";
import ReactDOM from "react-dom";

export default class FloatingFilter extends Component {
    constructor(props) {
        super();
        this.state = {
            parentModel: null
        }
    }

    onParentModelChanged(parentModel){
        this.setState ({
            parentModel: parentModel
        })
    }

    remove(item){
        this.props.onFloatingFilterChanged({
            model:this.state.parentModel.filter(it=>it != item)
        });
    }

    render() {
        if (!this.state.parentModel) return null;

        let that = this;
        let options = this.state.parentModel.map ((item, i)=>{
            let that = this;
            let removeMeListener = ()=>{
                this.remove(item)
            }
            let removeMeElement = <a onClick={removeMeListener}>[x]</a>;
            return <span key={i}>{item}{removeMeElement}</span>;
        });

        return <div>{options}</div>;
    }
}