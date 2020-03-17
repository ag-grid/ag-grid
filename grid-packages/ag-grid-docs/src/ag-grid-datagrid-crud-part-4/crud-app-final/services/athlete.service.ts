import {Injectable} from '@angular/core';
import {Athlete} from '../model/athlete.model';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AthleteService {
    static REQUEST_OPTIONS: RequestOptions = new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})});

    private apiRootUrl = 'http://localhost:8080';

    private findAllUrl = this.apiRootUrl + '/athletes';
    private findByIdUrl = this.apiRootUrl + '/athlete';
    private saveUpdateUrl = this.apiRootUrl + '/saveAthlete';
    private deleteUrl = this.apiRootUrl + '/deleteAthlete';


    constructor(private http: Http) {
    }

    findAll(): Observable<Athlete[]> {
        return this.http.get(this.findAllUrl)
            .map((response: Response) => response.json())
            .catch(this.defaultErrorHandler());
    }

    findById(id: number): Observable<Athlete> {
        return this.http.get(this.findByIdUrl + '/' + id)
            .map((response: Response) => response.json())
            .catch(this.defaultErrorHandler());
    }

    save(athlete: Athlete): Observable<Athlete> {
        return this.http.post(this.saveUpdateUrl, athlete, AthleteService.REQUEST_OPTIONS)
            .map((response: Response) => response.json())
            .catch(this.defaultErrorHandler());
    }

    delete(athlete: Athlete): Observable<boolean> {
        return this.http.post(this.deleteUrl, athlete.id, AthleteService.REQUEST_OPTIONS)
            .map((response: Response) => response.json())
            .catch(this.defaultErrorHandler());
    }

    private defaultErrorHandler() {
        return (error: any) => {
            console.log(error);
            return Observable.throw(error.json().error || 'Server error')
        };
    }
}
