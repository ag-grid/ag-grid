import React, {Component} from 'react';

export default class CustomNoRowsOverlayRenderer extends Component {
    render() {
        return (<div><i className="fa fa-frown-o"> No Rows!</i></div>);
    }
}