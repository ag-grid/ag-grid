import React, {Component} from 'react';

export default class CustomLoadingOverlayRenderer extends Component {
    render() {
        return (<div><i className="fa fa-hourglass-1"> One moment please...</i></div>);
    }
}