import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { Subject } from "rxjs";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { takeUntil, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { FuseUtils } from "@fuse/utils";
import { FaqService } from "app/services/faq.service";
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SupportDeskService } from 'app/services/support-desk.service';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';

@Component({
    selector: "app-faq",
    templateUrl: "./faq.component.html",
    styleUrls: ["./faq.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class FaqComponent implements OnInit {
    MenuItems: string[];
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole = "";
    currentDisplayName: string;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    fileToUpload: File;
    fileToUploadList: File[] = [];
    uploadForm: FormGroup;
    AttachmentData: SafeUrl;
    IsProgressBarVisibile: boolean;
    constructor(
        private formBuilder: FormBuilder,
        private httpClient: HttpClient,
        private sanitizer: DomSanitizer,
        private _supportDeskService: SupportDeskService,
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
            this.GetFAQAttachment();
        } else {
            this._router.navigate(['/auth/login']);
        }
    }
    ResetAttachments(): void {
        this.fileToUpload = null;
        this.fileToUploadList = [];
    }
    GetFAQAttachment(): void {
        this._supportDeskService.GetFAQAttachment().subscribe(
            data => {
                if (data) {
                    let fileType = 'application/pdf';
                    const blob = new Blob([data], { type: fileType });
                    const fileURL = URL.createObjectURL(blob);
                    this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
                }
                this.IsProgressBarVisibile = false;
            },
            error => {
                console.error(error);
                this.IsProgressBarVisibile = false;
            }
        );
    }
    onSelect(event): void {
        this.fileToUpload = event.addedFiles[0];
        const blob = new Blob([this.fileToUpload], { type: this.fileToUpload.type });
        const fileURL = URL.createObjectURL(blob);
        this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
        // console.log("hi" + this.files);
        // this.changeFile(this.files).then((base64: string): any => {
        //     console.log(base64);
        //     this.url = base64;
        //     this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

        // });
    }
    onRemove(event): void {
        console.log(event);
    }
    // changeFile(file) {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file);
    //         reader.onload = () => resolve(reader.result);
    //         reader.onerror = error => reject(error);
    //     });
    // }
    onFileSelect(event): void {
        if (event.target.value) {
            this.fileToUpload = event.target.files[0] as File;
            const blob = new Blob([this.fileToUpload], { type: this.fileToUpload.type });
            const fileURL = URL.createObjectURL(blob);
            this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
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
            alert('Nothing');
        }
    }
    SaveFAQAttachment(): void {
        if (this.fileToUpload && this.fileToUpload.size) {
            this.IsProgressBarVisibile = true;
            this._supportDeskService.SaveFAQAttachment(this.currentUserID.toString(), this.fileToUpload).subscribe(
                (dat) => {
                    this.ResetAttachments();
                    this.notificationSnackBarComponent.openSnackBar(`FAQ file uploaded successfully`, SnackBarStatus.success);
                    this.IsProgressBarVisibile = false;
                    this.GetFAQAttachment();
                },
                (err) => {
                    console.error(err);
                    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                    this.IsProgressBarVisibile = false;
                });
        } else {
            this.notificationSnackBarComponent.openSnackBar('Please select a pdf file to upload', SnackBarStatus.danger);
        }
    }


}
