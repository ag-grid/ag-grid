import React from 'react';
import RefData from './RefData';

// the skills filter component. this can be laid out much better in a 'React'
// way. there are design patterns you can apply to layout out your React classes.
// however, i'm not worried, as the intention here is to show you ag-Grid
// working with React, and that's all. i'm not looking for any awards for my
// React design skills.
export default class SkillsFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            android: false,
            css: false,
            html5: false,
            mac: false,
            windows: false
        };
    }

    getModel() {
        return {
            android: this.state.android,
            css: this.state.css,
            html5: this.state.html5,
            mac: this.state.mac,
            windows: this.state.windows
        }
    }

    setModel(model) {
        this.setState({
            android: model.android,
            css: model.css,
            html5: model.html5,
            mac: model.mac,
            windows: model.windows
        });
    }

    // called by agGrid
    doesFilterPass(params) {

        var rowSkills = params.data.skills;
        var passed = true;

        RefData.IT_SKILLS.forEach( (skill) => {
            if (this.state[skill]) {
                if (!rowSkills[skill]) {
                    passed = false;
                }
            }
        });

        return passed;
    };

    // called by agGrid
    isFilterActive() {
        var somethingSelected = this.state.android || this.state.css ||
            this.state.html5 || this.state.mac || this.state.windows;
        return somethingSelected;
    };

    onSkillChanged(skill, event) {
        var newValue = event.target.checked;
        var newModel = {};
        newModel[skill] = newValue;
        // set the state, and once it is done, then call filterChangedCallback
        this.setState(newModel, this.props.filterChangedCallback );
    }

    helloFromSkillsFilter() {
        alert("Hello From The Skills Filter!");
    }

    render() {

        var skillsTemplates = [];
        RefData.IT_SKILLS.forEach( (skill, index) => {

            var skillName = RefData.IT_SKILLS_NAMES[index];
            var template = (
                <label key={skill} style={{border: '1px solid lightgrey', margin: 4, padding: 4, display: 'inline-block'}}>
                    <span>
                        <div style={{textAlign: 'center'}}>{skillName}</div>
                        <div>
                            <input type="checkbox" onClick={this.onSkillChanged.bind(this, skill)}/>
                            <img src={'images/skills/'+skill+'.png'} width={30}/>
                        </div>
                    </span>
                </label>
            );

            skillsTemplates.push(template);
        });

        return (
            <div style={{width: 380}}>
                <div style={{textAlign: 'center', background: 'lightgray', width: '100%', display: 'block', borderBottom: '1px solid grey'}}>
                    <b>Custom Skills Filter</b>
                </div>
                {skillsTemplates}
            </div>
        );
    }

    // these are other method that agGrid calls that we
    // could of implemented, but they are optional and
    // we have no use for them in this particular filter.
    //afterGuiAttached(params) {}
    //onNewRowsLoaded() {}
    //onAnyFilterChanged() {}
}
