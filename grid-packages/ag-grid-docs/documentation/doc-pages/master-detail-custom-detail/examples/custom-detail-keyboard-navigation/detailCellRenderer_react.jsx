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

    this.eParentEl = props.eParentOfValue;
    this.eParentEl.addEventListener('focus', this.onParentElFocus);
  }

  onParentElFocus(event) {
    const currentEl = event.target;
    const previousEl = event.relatedTarget;
    const previousRowEl = findRowForEl(previousEl);
    const currentRow = currentEl && parseInt(currentEl.getAttribute('row-index'), 10);
    const previousRow = previousRowEl && parseInt(previousRowEl.getAttribute('row-index'), 10);

    const inputs = currentEl.querySelectorAll('input');
  
    // Navigating forward, or unknown previous row
    if (!previousRow || currentRow >= previousRow) {
        // Focus on the first input
        inputs[0].focus();
    } else { // Navigating backwards
        // Focus on the last input
        inputs[inputs.length - 1].focus();
    }
  }

  componentWillUnmount() {
    this.eParentEl.removeEventListener('focus', this.onParentElFocus);
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

function findRowForEl(el) {
  let rowEl = el;
  while (rowEl) {
      rowEl = rowEl.parentElement;
      if (rowEl && rowEl.getAttribute('role') === 'row') { return rowEl; }
  }

  return null;
}