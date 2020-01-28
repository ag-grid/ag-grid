import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ColumnAlignmentService {
    private alignmentChangedSource = new Subject<string>();

    alignmentChanged$ = this.alignmentChangedSource.asObservable();

    changeColumnAlignment(alignment: string) {
        this.alignmentChangedSource.next(alignment);
    }
}