import React, {Component} from 'react';
import { Button } from '@blueprintjs/core';
import { DateInput } from "@blueprintjs/datetime";

const padNum = (num, add = 0) => {
    const val = (num + add).toString();
    return (val.length === 1 ? '0' : '') + val;
}
export default class CustomDateComponent extends Component {

    constructor(props) {
        super(props);
        //The state of this component is represented of:
        //  The current date it holds, null by default, null if the date typed by the user is not valid or fields are blank
        //  The current values that the user types in the input boxes, by default ''

        //The textBoxes state is necessary since it can be set from ag-Grid. This can be seen in this example through
        // the usage of the button DOB equals to 01/01/2000 in the example page.
        this.state = {
            date: null,
            openPicker: false
        }
    }

    render() {
        //Inlining styles to make simpler the component
        let filterStyle = {
            margin: '0px'
        };

        return (
            <div style={filterStyle}>
               <DateInput
               inputProps={{
                   rightElement: <Button
                        icon='calendar'
                        //intent="primary"
                        minimal={true}
                        small={true}
                        onClick={() => {
                            this.setState({openPicker: !this.state.openPicker})
                            }
                        }
                />
                }}
                formatDate={date => padNum(date.getDate()) + '/' + padNum(date.getMonth(), 1) + '/' + date.getFullYear()}
                onChange={this.onDateChanged}
                parseDate={str => new Date(str)}
                placeholder={"DD/MM/YYYY"}
                value={this.state.date}
                popoverProps={{
                    isOpen: this.state.openPicker,
                    popoverClassName: 'ag-floating-filter-picker',
                    boundary: document.body,
                    onInteraction: (nextOpenState) => {
                        console.log(nextOpenState);
                        this.setState({openPicker: nextOpenState})
                    }
                }}
            />
            </div>
        );
    }

    //*********************************************************************************
    //          METHODS REQUIRED BY AG-GRID
    //*********************************************************************************

    getDate() {
        //ag-grid will call us here when in need to check what the current date value is hold by this
        //component.
        return this.state.date;
    }

    setDate(date) {
        //ag-grid will call us here when it needs this component to update the date that it holds.
        this.setState({date})
    }

    //*********************************************************************************
    //          LINKS THE INTERNAL STATE AND AG-GRID
    //*********************************************************************************

    updateAndNotifyAgGrid(date) {
        this.setState({
                date
            },
            //Callback after the state is set. This is where we tell ag-grid that the date has changed so
            //it will proceed with the filtering and we can then expect ag-Grid to call us back to getDate
            this.props.onDateChanged
        );
    }


    //*********************************************************************************
    //          LINKING THE UI, THE STATE AND AG-GRID
    //*********************************************************************************

    onDateChanged = (date, userChanged) => {
        if (userChanged) {
            this.setState({openPicker: false});
        }
        this.updateAndNotifyAgGrid(date)
    }
}
