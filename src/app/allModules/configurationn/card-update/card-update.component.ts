import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FactService } from 'app/services/fact.service';

@Component({
  selector: 'app-card-update',
  templateUrl: './card-update.component.html',
  styleUrls: ['./card-update.component.scss']
})
export class CardUpdateComponent implements OnInit {

  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole = "";
  currentDisplayName: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  fileToUpload1: File;
  fileToUpload2: File;
  fileToUploadList: File[] = [];
  uploadForm: FormGroup;
  AttachmentData1: SafeUrl;
  AttachmentData2: SafeUrl;
  IsProgressBarVisibile: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private sanitizer: DomSanitizer,
    private _FactService: FactService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.IsProgressBarVisibile = false;
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(
      this.snackBar
    );
  }

  ngOnInit(): void {

    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('ASN') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }
      this.uploadForm = this.formBuilder.group({
        profile: ['']
      });
      this.GetDashboardCard1();
      this.GetDashboardCard2();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetAttachments(): void {
    this.fileToUpload1 = null;
    this.fileToUpload2 = null;
    this.fileToUploadList = [];
  }
  GetDashboardCard1(): void {
    this._FactService.GetDashboardCard1().subscribe(
      res => {
        if (res) {
          const blob = res.image;
          console.log(res.filename);
          if (blob && res.filename && res.type) {
            this.fileToUpload1 = new File([blob], res.filename, { type: res.type, lastModified: Date.now() });
          }
          const fileURL = URL.createObjectURL(blob);
          this.AttachmentData1 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
        }
        this.IsProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetDashboardCard2(): void {
    this._FactService.GetDashboardCard2().subscribe(
      res => {
        if (res) {
          const blob = res.image;
          console.log(res.filename);
          if (blob && res.filename && res.type) {
            this.fileToUpload2 = new File([blob], res.filename, { type: res.type, lastModified: Date.now() });
          }
          const fileURL = URL.createObjectURL(blob);
          this.AttachmentData2 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
        }
        this.IsProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  onSelect1(event): void {
    this.fileToUpload1 = event.addedFiles[0];
    const blob = new Blob([this.fileToUpload1], { type: this.fileToUpload1.type });
    const fileURL = URL.createObjectURL(blob);
    this.AttachmentData1 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    // console.log("hi" + this.files);
    // this.changeFile(this.files).then((base64: string): any => {
    //     console.log(base64);
    //     this.url = base64;
    //     this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

    // });
  }
  onSelect2(event): void {
    this.fileToUpload2 = event.addedFiles[0];
    const blob = new Blob([this.fileToUpload2], { type: this.fileToUpload2.type });
    const fileURL = URL.createObjectURL(blob);
    this.AttachmentData2 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    // console.log("hi" + this.files);
    // this.changeFile(this.files).then((base64: string): any => {
    //     console.log(base64);
    //     this.url = base64;
    //     this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

    // });
  }
  // changeFile(file) {
  //     return new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.readAsDataURL(file);
  //         reader.onload = () => resolve(reader.result);
  //         reader.onerror = error => reject(error);
  //     });
  // }
  onFileSelect1(event): void {
    if (event.target.value) {
      this.fileToUpload1= event.target.files[0] as File;
      const blob = new Blob([this.fileToUpload1], { type: this.fileToUpload1.type });
      const fileURL = URL.createObjectURL(blob);
      this.AttachmentData1 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      // const type = file.type;
      // this.changeFile(file).then((base64: string): any => {
      //     console.log(base64);
      //     this.url = base64;
      //     this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      //     // this.fileBlob = this.b64Blob([base64], type);
      //     const blob = new Blob([base64], { type: 'application/octet-stream' });
      //     console.log(blob);
      //     const objectURL = URL.createObjectURL(blob);
      //     console.log(objectURL)
      //     var url1 = window.URL.createObjectURL(blob);
      //     // reader.readAsDataURL(file);
      //     console.log("url1:" + url1);
      //     // console.log(this.fileBlob)
      // });
    } else {
      // alert('Nothing');
    }
  }
  onFileSelect2(event): void {
    if (event.target.value) {
      this.fileToUpload2 = event.target.files[0] as File;
      const blob = new Blob([this.fileToUpload2], { type: this.fileToUpload2.type });
      const fileURL = URL.createObjectURL(blob);
      this.AttachmentData2 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      // const type = file.type;
      // this.changeFile(file).then((base64: string): any => {
      //     console.log(base64);
      //     this.url = base64;
      //     this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      //     // this.fileBlob = this.b64Blob([base64], type);
      //     const blob = new Blob([base64], { type: 'application/octet-stream' });
      //     console.log(blob);
      //     const objectURL = URL.createObjectURL(blob);
      //     console.log(objectURL)
      //     var url1 = window.URL.createObjectURL(blob);
      //     // reader.readAsDataURL(file);
      //     console.log("url1:" + url1);
      //     // console.log(this.fileBlob)
      // });
    } else {
      // alert('Nothing');
    }
  }
  SaveDashboardCards(): void {
    this.fileToUploadList = [];
    if (this.fileToUpload1 && this.fileToUpload1.size) {
      this.fileToUploadList.push(this.fileToUpload1);
    }
    if (this.fileToUpload2 && this.fileToUpload2.size) {
      this.fileToUploadList.push(this.fileToUpload2);
    }
    if (this.fileToUploadList && this.fileToUploadList.length) {
      this.IsProgressBarVisibile = true;
      this._FactService.SaveDashboardCards(this.currentUserID.toString(), this.fileToUploadList).subscribe(
        (dat) => {
          this.ResetAttachments();
          this.notificationSnackBarComponent.openSnackBar(`Card images uploaded successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetDashboardCard1();
          this.GetDashboardCard2();
        },
        (err) => {
          console.error(err);
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
          this.IsProgressBarVisibile = false;
        });
    } else {
      this.notificationSnackBarComponent.openSnackBar('Please select atleast one image file to upload', SnackBarStatus.danger);
    }
  }
}
