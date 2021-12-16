import React, {Component, createRef} from "react";

export default class PersonFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filterText: null
        }
    }

    doesFilterPass(params) {
        const { api, colDef, column, columnApi, context } = this.props;
        const { node } = params;

        // make sure each word passes separately, ie search for firstname, lastname
        let passed = true;
        this.state.filterText.toLowerCase().split(' ').forEach(filterWord => {
            const value = this.props.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });

            if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                passed = false;
            }
        });

        return passed;
    }

    isFilterActive() {
        return this.state.filterText != null && this.state.filterText !== '';
    }

    getModel() {
        if (!this.isFilterActive()) { return null; }

        return {value: this.state.filterText};
    }

    setModel(model) {
        this.ref.current.value = model == null ? null : model.value;
    }

    onChange(event) {
        this.setState({filterText: event.target.value},
            () => this.props.filterChangedCallback()
        );
    }

    render() {
        return (
            <div style={{padding: 4, width: 200}}>
                <div style={{fontWeight: "bold"}}>Custom Athlete Filter</div>
                <div>
                    <input style={{margin: "4 0 4 0"}} type="text" value={this.state.filterText} onChange={this.onChange.bind(this)} placeholder="Full name search..."/>
                </div>
                <div style={{marginTop: 20}}>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
                <div style={{marginTop: 20}}>Just to emphasise that anything can go in here, here is an image!!</div>
                <div>
                    <img src="https://www.ag-grid.com/images/ag-Grid2-200.png"
                         style={{width: 150, textAlign: "center", padding: 10, margin: 10, border: "1px solid lightgrey"}}/>
                </div>
            </div>
        );
    }
}
