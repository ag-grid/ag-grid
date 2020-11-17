import React, { Component } from 'react';

export default class DetailCellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            callCount: props.data.calls,
            lastUpdated: new Date().toLocaleTimeString()
        };
    }

    refresh(params) {
        // check and see if we need to get the grid to tear this
        // component down and update it again
        return params.data.calls === this.state.callCount;
    }

    render() {
        return (
            <div>
                <form>
                    <div>
                        <p>
                            <label>
                                Calls:<br />
                                <input type="text" value={this.state.callCount} onChange={e => this.setState({ callCount: e.target.value })} />
                            </label>
                        </p>
                        <p>
                            <label>
                                Last Updated: {this.state.lastUpdated}
                            </label>
                        </p>
                    </div>
                </form>
            </div>
        );
    }
}