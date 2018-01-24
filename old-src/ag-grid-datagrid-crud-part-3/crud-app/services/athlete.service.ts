import {Injectable} from '@angular/core';
import {Athlete} from '../model/athlete.model';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AthleteService {

    private apiUrl = 'http://localhost:8090/athletes';

    constructor(private http: Http) {
    }

    findAll(): Observable<Athlete[]> {
        return this.http.get(this.apiUrl)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}
