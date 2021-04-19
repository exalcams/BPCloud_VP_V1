import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { BPVendorOnBoarding, BPIdentity, BPBank, BPContact, BPActivityLog, BPVendorOnBoardingView } from 'app/models/vendor-registration';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class VendorRegistrationService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // VendorOnBoardings
  GetAllVendorOnBoardings(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}vendorregisterapi/Registration/GetAllVendorOnBoardings`)
      .pipe(catchError(this.errorHandler));
  }

  GetRegisteredVendorOnBoardings(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}vendorregisterapi/Registration/GetRegisteredVendorOnBoardings`)
      .pipe(catchError(this.errorHandler));
  } 

  CreateVendorOnBoarding(VendorOnBoarding: BPVendorOnBoardingView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendorregisterapi/Registration/CreateVendorOnBoarding`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateVendorOnBoarding(VendorOnBoarding: BPVendorOnBoardingView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendorregisterapi/Registration/UpdateVendorOnBoarding`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteVendorOnBoarding(VendorOnBoarding: BPVendorOnBoarding): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendorregisterapi/Registration/DeleteVendorOnBoarding`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  ApproveVendor(VendorOnBoarding: BPVendorOnBoarding): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendorregisterapi/Registration/ApproveVendor`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  RejectVendor(VendorOnBoarding: BPVendorOnBoarding): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendorregisterapi/Registration/RejectVendor`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetIdentificationsByVOB(TransID: number): Observable<BPIdentity[] | string> {
    return this._httpClient.get<BPIdentity[]>(`${this.baseAddress}vendorregisterapi/Registration/GetIdentitiesByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetBanksByVOB(TransID: number): Observable<BPBank[] | string> {
    return this._httpClient.get<BPBank[]>(`${this.baseAddress}vendorregisterapi/Registration/GetBanksByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
 
  GetContactsByVOB(TransID: number): Observable<BPContact[] | string> {
    return this._httpClient.get<BPContact[]>(`${this.baseAddress}vendorregisterapi/Registration/GetContactsByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetActivityLogsByVOB(TransID: number): Observable<BPActivityLog[] | string> {
    return this._httpClient.get<BPActivityLog[]>(`${this.baseAddress}vendorregisterapi/Registration/GetActivityLogsByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }

  AddUserAttachment(TransID: number, CreatedBy: string, selectedFiles: File[]): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFiles && selectedFiles.length) {
      selectedFiles.forEach(x => {
        formData.append(x.name, x, x.name);
      });
    }
    formData.append('TransID', TransID.toString());
    formData.append('CreatedBy', CreatedBy.toString());

    return this._httpClient.post<any>(`${this.baseAddress}vendorregisterapi/Attachment/AddUserAttachment`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }


}
