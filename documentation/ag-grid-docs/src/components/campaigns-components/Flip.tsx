import Tick from '@pqina/flip';
import '@pqina/flip/dist/flip.min.css';
import React from 'react';

import './FlipCountdown.scss';

export default class Flip extends React.Component {
    constructor(props) {
        super(props);
        this._tickRef = React.createRef();
    }

    componentDidMount() {
        this._tickInstance = Tick.DOM.create(this._tickRef.current, {
            value: this.props.value,
        });
    }

    componentDidUpdate() {
        if (!this._tickInstance) return;
        this._tickInstance.value = this.props.value;
    }

    componentWillUnmount() {
        if (!this._tickInstance) return;
        Tick.DOM.destroy(this._tickRef.current);
    }

    render() {
        return (
            <div ref={this._tickRef} className="tick">
                <div className="tick-group" data-repeat="true" aria-hidden="true">
                    <span data-view="flip">Tick</span>
                </div>
            </div>
        );
    }
}
