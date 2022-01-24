import React, {Component} from 'react';

export default class MoodRenderer extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setMood(this.props.value);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.value !== prevProps.value) {
            this.setMood(this.props.value);
        }
    }

    setMood(mood) {
        this.setState({
            imgForMood: 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png')
        });
    };

    render() {
        return (
            <img width="20px" src={this.state.imgForMood}/>
        );
    }
}
