import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { CBPLocation } from 'app/models/vendor-master';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VendorMasterService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // Location
  GetLocationByPincode(Pincode: string): Observable<CBPLocation | string> {
    return this._httpClient.get<CBPLocation>(`${this.baseAddress}vendormasterapi/Master/GetLocationByPincode?Pincode=${Pincode}`)
      .pipe(catchError(this.errorHandler));
  }
}
