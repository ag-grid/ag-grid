import RefData from "./refData";

const SKILL_TEMPLATE =
    '<label style="border: 1px solid lightgrey; margin: 4px; padding: 4px; display: inline-block;">' +
    '  <span>' +
    '    <div style="text-align: center;">SKILL_NAME</div>' +
    '    <div>' +
    '      <input type="checkbox"/>' +
    '      <img src="images/skills/SKILL.png" width="30px"/>' +
    '    </div>' +
    '  </span>' +
    '</label>';

const FILTER_TITLE =
    '<div style="text-align: center; background: lightgray; width: 100%; display: block; border-bottom: 1px solid grey;">' +
    '<b>TITLE_NAME</b>' +
    '</div>';

export class SkillFilter {
    init(params){
        this.filterChangedCallback = params.filterChangedCallback;
        this.model = {
            android: false,
            css: false,
            html5: false,
            mac: false,
            windows: false
        };
    }

    getGui() {
        let eGui = document.createElement('div');
        eGui.style.width = '380px';
        let eInstructions = document.createElement('div');
        eInstructions.innerHTML = FILTER_TITLE.replace('TITLE_NAME', 'Custom Skills Filter');
        eGui.appendChild(eInstructions);

        let that = this;

        RefData.IT_SKILLS.forEach(function (skill, index) {
            let skillName = RefData.IT_SKILLS_NAMES[index];
            let eSpan = document.createElement('span');
            let html = SKILL_TEMPLATE.replace("SKILL_NAME", skillName).replace("SKILL", skill);
            eSpan.innerHTML = html;

            let eCheckbox = eSpan.querySelector('input');
            eCheckbox.addEventListener('click', function () {
                that.model[skill] = eCheckbox.checked;
                that.filterChangedCallback();
            });

            eGui.appendChild(eSpan);
        });

        return eGui;
    }

    doesFilterPass(params) {

        let rowSkills = params.data.skills;
        let model = this.model;
        let passed = true;

        RefData.IT_SKILLS.forEach(function (skill) {
            if (model[skill]) {
                if (!rowSkills[skill]) {
                    passed = false;
                }
            }
        });

        return passed;
    }

    isFilterActive() {
        let model = this.model;
        let somethingSelected = model.android || model.css || model.html5 || model.mac || model.windows;
        return somethingSelected;
    }

    getModel(){
        return undefined;
    }

    setModel(model){
    }
}

