import React, {Component} from "react";

export default class YearFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            year: "All"
        }
    }

    doesFilterPass(params) {
        return params.data.year >= 2010;
    }

    isFilterActive() {
        return this.state.year === '2010'
    }

    // this example isn't using getModel() and setModel(),
    // so safe to just leave these empty. don't do this in your code!!!
    getModel() {
    }

    setModel() {
    }

    onYearChange(event) {
        this.setState({year: event.target.value},
            () => this.props.filterChangedCallback()
        );
    }

    render() {
        return (
            <div style={{display: "inline-block", width: "400px"}} onChange={this.onYearChange.bind(this)}>
                <div style={{padding: "10px", backgroundColor: "#d3d3d3", textAlign: "center"}}>This is a very wide filter</div>
                <label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
                    <input type="radio" name="year" value="All" checked={this.state.year === 'All'}/> All
                </label>
                <label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
                    <input type="radio" name="year" value="2010" /> Since 2010
                </label>
            </div>
        );
    }
}
