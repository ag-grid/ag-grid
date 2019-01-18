import {Component, ViewEncapsulation} from "@angular/core";

import RefData from "./data/refData";

@Component({
    selector: 'skills-renderer',
    template: `
     <img *ngFor="let skill of skills"  src="/images/skills/{{skill}}.png" width="16px" title="{{skill}}" />
    `
})
export class SkillsRendererComponent {
    private params: any;
    private skills: string[] = [];

    // called on init
    agInit(params: any): void {
        this.params = params;

        RefData.IT_SKILLS.forEach((skill) => {
            if (this.params.data && this.params.data.skills && this.params.data.skills[skill]) {
                this.skills.push(skill);
            }
        });
    }
}
