const SKILL_TEMPLATE =
    '<div style="border: 1px solid lightgrey; margin: 4px; padding: 4px;">' +
    '  <span>' +
    '    <div style="text-align: center;">SKILL_NAME</div>' +
    '    <div>' +
    '      <input type="checkbox"/>' +
    '      <img src="/images/skills/SKILL.png" width="30px"/>' +
    '    </div>' +
    '  </span>' +
    '</div>';

const FILTER_TITLE =
    '<div style="text-align: center; background: lightgray; width: 100%; display: block; border-bottom: 1px solid grey;">' +
    '<b>TITLE_NAME</b>' +
    '</div>';

function SkillFilter() {
}

SkillFilter.prototype.init = function (params) {
    this.filterChangedCallback = params.filterChangedCallback;
    this.model = {
        android: false,
        css: false,
        html5: false,
        mac: false,
        windows: false
    };
};

SkillFilter.prototype.getModel = function () {
};

SkillFilter.prototype.setModel = function (model) {

};

SkillFilter.prototype.getGui = function () {
    const eGui = document.createElement('div');

    const eInstructions = document.createElement('div');
    eInstructions.innerHTML = FILTER_TITLE.replace('TITLE_NAME', 'Custom Skills Filter');
    eGui.appendChild(eInstructions);

    const that = this;

    IT_SKILLS.forEach(function (skill, index) {
        const skillName = IT_SKILLS_NAMES[index];
        const eSpan = document.createElement('span');
        eSpan.style = "float: left";
        const html = SKILL_TEMPLATE.replace("SKILL_NAME", skillName).replace("SKILL", skill);
        eSpan.innerHTML = html;

        const eCheckbox = eSpan.querySelector('input');
        eCheckbox.addEventListener('click', function () {
            that.model[skill] = eCheckbox.checked;
            that.filterChangedCallback();
        });

        eGui.appendChild(eSpan);
    });

    return eGui;
};

SkillFilter.prototype.doesFilterPass = function (params) {

    const rowSkills = params.data.skills;
    const model = this.model;
    let passed = true;

    IT_SKILLS.forEach(function (skill) {
        if (model[skill]) {
            if (!rowSkills[skill]) {
                passed = false;
            }
        }
    });

    return passed;
};

SkillFilter.prototype.isFilterActive = function () {
    const model = this.model;
    const somethingSelected = model.android || model.css || model.html5 || model.mac || model.windows;
    return somethingSelected;
};