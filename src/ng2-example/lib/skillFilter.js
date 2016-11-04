"use strict";
var refData_1 = require('./refData');
var SKILL_TEMPLATE = '<label style="border: 1px solid lightgrey; margin: 4px; padding: 4px; display: inline-block;">' +
    '  <span>' +
    '    <div style="text-align: center;">SKILL_NAME</div>' +
    '    <div>' +
    '      <input type="checkbox"/>' +
    '      <img src="/images/skills/SKILL.png" width="30px"/>' +
    '    </div>' +
    '  </span>' +
    '</label>';
var FILTER_TITLE = '<div style="text-align: center; background: lightgray; width: 100%; display: block; border-bottom: 1px solid grey;">' +
    '<b>TITLE_NAME</b>' +
    '</div>';
var SkillFilter = (function () {
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
    ;
    SkillFilter.prototype.getGui = function () {
        var eGui = document.createElement('div');
        eGui.style.width = '380px';
        var eInstructions = document.createElement('div');
        eInstructions.innerHTML = FILTER_TITLE.replace('TITLE_NAME', 'Custom Skills Filter');
        eGui.appendChild(eInstructions);
        var that = this;
        refData_1.default.IT_SKILLS.forEach(function (skill, index) {
            var skillName = refData_1.default.IT_SKILLS_NAMES[index];
            var eSpan = document.createElement('span');
            var html = SKILL_TEMPLATE.replace("SKILL_NAME", skillName).replace("SKILL", skill);
            eSpan.innerHTML = html;
            var eCheckbox = eSpan.querySelector('input');
            eCheckbox.addEventListener('click', function () {
                that.model[skill] = eCheckbox.checked;
                that.filterChangedCallback();
            });
            eGui.appendChild(eSpan);
        });
        return eGui;
    };
    ;
    SkillFilter.prototype.doesFilterPass = function (params) {
        var rowSkills = params.data.skills;
        var model = this.model;
        var passed = true;
        refData_1.default.IT_SKILLS.forEach(function (skill) {
            if (model[skill]) {
                if (!rowSkills[skill]) {
                    passed = false;
                }
            }
        });
        return passed;
    };
    ;
    SkillFilter.prototype.isFilterActive = function () {
        var model = this.model;
        var somethingSelected = model.android || model.css || model.html5 || model.mac || model.windows;
        return somethingSelected;
    };
    ;
    SkillFilter.prototype.getModel = function () {
        return undefined;
    };
    SkillFilter.prototype.setModel = function (model) {
    };
    return SkillFilter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SkillFilter;
//# sourceMappingURL=skillFilter.js.map