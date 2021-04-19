import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Guid } from 'guid-typescript';

@Injectable({
    providedIn: 'root'
})
export class DataMigrationService {

    baseAddress: string;
    constructor(private _httpClient: HttpClient, private _authService: AuthService) {
        this.baseAddress = _authService.baseAddress;
    }

    // Error Handler
    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error || error.message || 'Server Error');
    }

    UploadDataMigrationAttachment(CreatedBy: string, selectedFiles: File[]): Observable<any> {
        const formData: FormData = new FormData();
        if (selectedFiles && selectedFiles.length) {
            selectedFiles.forEach(x => {
                formData.append(x.name, x, x.name);
            });
        }
        formData.append('CreatedBy', CreatedBy);
        return this._httpClient.post<any>(`${this.baseAddress}datamigrationapi/DataMigration/UploadDataMigrationAttachment`,
            formData,
            // {
            //     headers: new HttpHeaders({
            //         'Content-Type': 'application/json'
            //     })
            // }
        ).pipe(catchError(this.errorHandler));

    }

}
