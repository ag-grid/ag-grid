import React from 'react';

// custom cell for the proficiency column
export default class ProficiencyCustomCell extends React.Component {

    render() {
        let backgroundColor;
        if (this.props.value < 20) {
            backgroundColor = 'red';
        } else if (this.props.value < 60) {
            backgroundColor = '#ff9900';
        } else {
            backgroundColor = '#00A000';
        }

        return (
            <div className="div-percent-bar" style={{width: this.props.value + '%', backgroundColor: backgroundColor}}>
                <div className="div-percent-value">{this.props.value}%</div>
            </div>
        );
    }
}
