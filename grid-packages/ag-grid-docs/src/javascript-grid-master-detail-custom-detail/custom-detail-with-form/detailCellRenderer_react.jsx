import React, { Component } from 'react';

export default class DetailCellRenderer extends Component {
  constructor(props) {
    super(props);

    const firstRecord = props.data.callRecords[0];

    this.state = {
      callId: firstRecord.callId,
      number: firstRecord.number,
      direction: firstRecord.direction
    };
  }

  render() {
    return (
      <div>
        <form>
          <div>
            <p>
              <label>
                Call Id:<br />
                <input type="text" value={this.state.callId} onChange={e => this.setState({ callId: e.target.value })} />
              </label>
            </p>
            <p>
              <label>
                Number:<br />
                <input type="text" value={this.state.number} onChange={e => this.setState({ number: e.target.value })} />
              </label>
            </p>
            <p>
              <label>
                Direction:<br />
                <input type="text" value={this.state.direction} onChange={e => this.setState({ direction: e.target.value })} />
              </label>
            </p>
          </div>
        </form>
      </div>
    );
  }
}