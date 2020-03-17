import {Component, OnInit} from '@angular/core';
import {AthleteService} from './services/athlete.service';
import {Athlete} from './model/athlete.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private athletes: Athlete[];

    constructor(private athleteService: AthleteService) {
    }

    ngOnInit() {
        this.athleteService.findAll().subscribe(
            athletes => {
                this.athletes = athletes
            },
            error => {
                console.log(error);
            }
        )
    }
}
