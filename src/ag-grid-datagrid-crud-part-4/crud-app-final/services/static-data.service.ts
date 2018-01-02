import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {Sport} from '../model/sport.model';
import {Country} from '../model/country.model';
import {StaticData} from '../model/static-data.model';

@Injectable()
export class StaticDataService {
    private apiRootUrl = 'http://localhost:8080';

    private countriesUrl = this.apiRootUrl + '/countries';
    private sportsUrl = this.apiRootUrl + '/sports';

    static alphabeticalSort() {
        return (a: StaticData, b: StaticData) => a.name.localeCompare(b.name);
    }

    constructor(private http: Http) {
    }

    countries(): Observable<Country[]> {
        return this.http.get(this.countriesUrl)
            .map((response: Response) => response.json())
            .catch(this.defaultErrorHandler());
    }

    sports(): Observable<Sport[]> {
        return this.http.get(this.sportsUrl)
            .map((response: Response) => response.json())
            .catch(this.defaultErrorHandler());
    }

    private defaultErrorHandler() {
        return (error: any) => Observable.throw(error.json().error || 'Server error');
    }
}
