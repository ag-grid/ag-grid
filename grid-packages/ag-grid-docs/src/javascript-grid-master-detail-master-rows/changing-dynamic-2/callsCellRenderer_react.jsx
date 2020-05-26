import React, {Component} from 'react';

export default class CustomLoadingCellRenderer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };

        this.props = props;
    }

    refresh(props) {
        this.setState({
            value: props.value,
        });
        return true;
    }

    onAdd() {
        var oldData = this.props.node.data;

        var oldCallRecords = oldData.callRecords;

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.push({
            name: ["Bob","Paul","David","John"][Math.floor(Math.random()*4)],
            callId: Math.floor(Math.random()*1000),
            duration: Math.floor(Math.random()*100) + 1,
            switchCode: "SW5",
            direction: "Out",
            number: "(02) " + Math.floor(Math.random()*1000000)
        }); // add one item

        var minutes = 0;
        newCallRecords.forEach( (r) => minutes += r.duration );

        var newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords
        };

        this.props.api.applyTransaction({update: [newData]});

        this.props.node.setExpanded(true);
    }

    onRemove() {

        var oldData = this.props.node.data;

        var oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length==0) { return; }

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        var minutes = 0;
        newCallRecords.forEach( (r) => minutes += r.duration );

        var newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords
        };

        this.props.api.applyTransaction({update: [newData]});
    }

    render() {
        return (
            <div className="calls-cell-renderer">
                <button onClick={this.onAdd.bind(this)}>+</button>
                <button onClick={this.onRemove.bind(this)}>-</button>
                <span>{this.state.value}</span>
            </div>
        );
    }
}
