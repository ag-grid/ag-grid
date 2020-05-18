import React, {Component} from 'react';

export default class DetailCellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstRecord: props.data.callRecords[0]
        }
    }

    render() {
        return (
            <div>
                <form>
                    <div>
                      <p>
                        <label>
                          Call Id:<br/>
                          <input type="text" value={this.state.firstRecord.callId}/>
                        </label>
                      </p>
                      <p>
                        <label>
                          Number:<br/>
                          <input type="text" value={this.state.firstRecord.number}/>
                        </label>
                      </p>
                      <p>
                        <label>
                            Direction:<br/>
                            <input type="text" value={this.state.firstRecord.direction}/>
                        </label>
                      </p>
                    </div>
                </form>
            </div>
        );
    }
}