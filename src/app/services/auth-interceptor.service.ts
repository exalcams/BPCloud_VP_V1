import { Injectable, Compiler } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthenticationDetails } from 'app/models/master';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import * as SecureLS from 'secure-ls';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  authenticationDetails: AuthenticationDetails;
  baseAddress: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _compiler: Compiler,
    public snackBar: MatSnackBar,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.authenticationDetails = new AuthenticationDetails();
    this.baseAddress = this._authService.baseAddress;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | any {
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      const authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      if (authenticationDetails) {
        const token: string = authenticationDetails.Token;
        if (token) {
          request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
        }
      }
    }

    if (!request.headers.has('Content-Type') && !request.url.includes('Attachment') && !request.url.includes('SaveDashboardCards')) {
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
    }

    // request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // // console.log('event--->>>', event);
          // this.errorDialogService.openDialog(event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        // return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
        if (error.error instanceof ErrorEvent) {
          // client-side error
          // errorMessage = `Error: ${error.error.message}`;
          if (error.error.message.includes('http') || error.error.message.includes('entity')) {
            errorMessage = 'Something went wrong';
          } else {
            errorMessage = error.error.message;
          }
        } else {
          // server-side error
          // errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          if (error.error) {
            // tslint:disable-next-line:max-line-length
            if (error.error.includes('http') || error.error.includes('entity') || error.error.includes('emami') || error.error.includes('metadata') || error.error.includes('TCP/IP')) {
              errorMessage = 'Something went wrong';
            } else {
              errorMessage = error.error;
            }
          } else {
            // tslint:disable-next-line:max-line-length
            if (error.message.includes('http') || error.message.includes('entity') || error.message.includes('emami') || error.message.includes('metadata') || error.message.includes('TCP/IP')) {
              errorMessage = 'Something went wrong';
            } else {
              errorMessage = error.message;
            }
          }

        }
        return throwError(errorMessage);
      })
    );
  }
  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | any {
  //   const retrievedObject = this.SecureStorage.get('authorizationData');
  //   if (retrievedObject) {
  //     const authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
  //     if (authenticationDetails) {
  //       const token: string = authenticationDetails.Token;
  //       if (token) {
  //         request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
  //       }
  //     }
  //   }

  //   if (!request.headers.has('Content-Type') && !request.url.includes('Attachment') && !request.url.includes('SaveDashboardCards')) {
  //     request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
  //   }

  //   // request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

  //   return next.handle(request).pipe(
  //     map((event: HttpEvent<any>) => {
  //       if (event instanceof HttpResponse) {
  //         // console.log('event--->>>', event);
  //         // this.errorDialogService.openDialog(event);
  //       }
  //       return event;
  //     }),
  //     catchError((error: HttpErrorResponse) => {
  //       return throwError(error);
  //     })
  //   );
  // }
}
