import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CAPADialogResponse, CAPADialogResponseFiles, CAPAReqItem, CAPAReqView, CAPAResItem, CAPAResItemView, CAPAResponseView } from 'app/models/CAPA';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { CapaService } from 'app/services/capa.service';
import { log } from 'console';
import { CapaResponseDialogComponent } from '../capa-response-dialog/capa-response-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-capa-response',
  templateUrl: './capa-response.component.html',
  styleUrls: ['./capa-response.component.scss']
})
export class CapaResponseComponent implements OnInit {
  SelectedID: any;
  SelectedVendor: CAPAReqView;
  ItemList: any[] = [];
  FileUploadList: CAPADialogResponseFiles[] = [];
  HeaderFormGroup: FormGroup;
  ResponseDetails: CAPAResponseView;
  FooterVisible = true;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  @ViewChild(MatSort) CheckListSort: MatSort;

  CheckListDataSource = new MatTableDataSource<CAPAReqItem>();
  CheckListDisplayColumns = ["ReqItemID", "Text", "DueDate", "Priority", "Impact", "Department", "Type", "IsDocumentRequired", "Action"];
  authenticationDetails: any;
  CurrentUserID: any;
  currentUserName: any;
  CurrentUserRole: any;
  MenuItems: any;
  isProgressBarVisibile = false;
  // constructor(private _route: ActivatedRoute, private _capaService: CapaService, private _router: Router,
  //   private dialog: MatDialog, private _formBuilder: FormBuilder, public snackBar: MatSnackBar) {
  BGClassName: any;
  Type: any;
  constructor(private _route: ActivatedRoute, private _capaService: CapaService, private _router: Router,
    private dialog: MatDialog, private _formBuilder: FormBuilder, public snackBar: MatSnackBar, private _datePipe: DatePipe,) {
    this.SelectedVendor = new CAPAReqView();
    this.ResponseDetails = new CAPAResponseView();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);

    this.ResponseDetails.CAPAResItems = [];
  }

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      this.SelectedID = params['id'];
      this.Type = params['Type'];
    });
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('CAPAResponse') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    }
    this.InitializeHeaderFormGroup();
    this.LoadReqestVendorDetails();

  }
  LoadReqestVendorDetails() {

    this.isProgressBarVisibile = true;
    this._capaService.GetCAPAReqByReqId(this.SelectedID).subscribe(
      (res) => {
        if (res) {
          this.SelectedVendor = res as CAPAReqView;
          var item = this.SelectedVendor.CAPAReqItems;
          this.SelectedVendor.CAPAReqItems.forEach(items => {
            if (items.IsDocumentRequired === true) {
              items.IsDocumentRequired = "Yes";
            }
            else {
              items.IsDocumentRequired = "No";
            }
            this.ItemList.push(items);
          });
          if (this.Type != "Accept") {
            this.ItemList.forEach((item, Index) => {
              if (item.Status == "Closed") {
                this.ItemList.splice(Index, 1);
              }
            });
          }
          console.log('ItemList', this.ItemList);

          this.LoadHeaderDetails();

          if (this.Type != "Respond") {
            this.GetCAPABuyerResponseItem();
          }
          else {
            this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.ItemList);
            this.CheckListDataSource.sort = this.CheckListSort;
            this.GetResponseDetails();
          }

        }
      },
      (err) => {

      }
    );
  }
  GetResponseDetails() {
    this.isProgressBarVisibile = true;
    var file: File;
    console.log('GetResponseDetails - ItemList', this.ItemList);
    var ItemIndex = [];
    this.ItemList.forEach((items, index) => {
      this._capaService.ViewResponseItem(items.ReqID, items.ReqItemID, this.currentUserName).subscribe(
        async (data) => {
          if (data != null) {
            const item = data as CAPAResItemView;
            if (item.AttachmentID > 0) {
              const base64Response = await fetch(`data:${item.ContentType};base64,${item.AttachmentFile}`);
              const blobs = await base64Response.blob();
              let fileType = 'image/jpg';
              fileType = item.AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
                item.AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                  item.AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
                    item.AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' :
                      item.AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
              const blob = new Blob([blobs], { type: fileType });

              file = new File([blob], item.AttachmentName, { type: fileType })
              const files = new CAPADialogResponseFiles();
              files.ReqItemID = item.ReqItemID;
              files.PatnerID = this.currentUserName;
              files.Files = file;
              this.FileUploadList.push(files);
            }
            var Resitem = new CAPAResItem();
            Resitem.ReqID = this.SelectedID;
            Resitem.ReqItemID = item.ReqItemID;
            Resitem.PartnerID = this.currentUserName;
            Resitem.Text = item.Text;
            Resitem.Status = item.Status;
            Resitem.DueDate = item.DueDate;
            this.ResponseDetails.CAPAResItems.forEach((Responseitems, index) => {
              if (Responseitems.ReqItemID == item.ReqItemID) {
                this.ResponseDetails.CAPAResItems.splice(index, 1);
              }
            });
            if (this.Type == "Respond") {
              if (Resitem.Status == "Resolved" || Resitem.Status == "Differed" || Resitem.Status == "Reject") {
                this.ItemList.splice(index, 1);
                this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.ItemList);
                this.CheckListDataSource.sort = this.CheckListSort;
              }
              else {
                this.ResponseDetails.CAPAResItems.push(Resitem);
              }
            }
            else {
              this.ResponseDetails.CAPAResItems.push(Resitem);
            }
          }
        });
    });

    // if(this.ResponseDetails.CAPAResItems.length >0)
    //  {
    //    var Index=[];
    //   this.ResponseDetails.CAPAResItems.forEach((element,index) => {
    //     if(element.Status == "Resolved" || element.Status == "Differed")
    //     {
    //       this.ResponseDetails.CAPAResItems.splice(index,1);
    //     }
    //   });
    // }
    console.log("ResponseDetails", this.ResponseDetails);
    this.isProgressBarVisibile = false;
  }
  GetCAPABuyerResponseItem() {
    this.isProgressBarVisibile = true;
    if (this.Type == "ResolvedDiffered") {
      this.Type = "Others";
    }
    this._capaService.GetCAPABuyerResponseItem(this.SelectedID, this.currentUserName, this.Type).subscribe(
      (data) => {
        this.ItemList = [];
        this.ItemList = data as CAPAReqItem[];
        this.ItemList.forEach(element => {
          if (element.IsDocumentRequired === true) {
            element.IsDocumentRequired = "Yes";
          }
          else {
            element.IsDocumentRequired = "No";
          }
        });
        console.log('GetCAPABuyerResponseItem - ItemList', this.ItemList);
        this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.ItemList);
        this.CheckListDataSource.sort = this.CheckListSort;
        this.LoadHeaderDetails();
        this.GetResponseDetails();
        this.isProgressBarVisibile = false;
      },
      (err) => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  LoadHeaderDetails() {
    this.HeaderFormGroup.get('Text').patchValue(this.SelectedVendor.Text);
    this.HeaderFormGroup.get('DueDate').patchValue(this.SelectedVendor.DueDate);
    this.HeaderFormGroup.disable();
    if (this.SelectedVendor.Status === "Closed") {
      this.FooterVisible = false;
    }
    this.isProgressBarVisibile = false;
  }
  InitializeHeaderFormGroup(): void {
    this.HeaderFormGroup = this._formBuilder.group({
      Text: ['', Validators.required],
      DueDate: ['', Validators.required]
    });
  }
  ViewItem(Reqitem: any) {
    var Resitem = new CAPAResItem();
    var Resitem = this.ResponseDetails.CAPAResItems.find(x => x.ReqItemID == Reqitem.ReqItemID);
    if (Resitem) {
      if (Resitem.Status != "Open" && Resitem.ResItemID > 0) {
        this.ResponseItem(Resitem, true);
      }
      else {
        console.log("Reqitem", Reqitem);
        this.ResponseItem(Resitem, false, Reqitem.IsDocumentRequired);
      }
    }
    else {
      this.ResponseItem(Reqitem);
    }
  }
  // ViewItem(Reqitem: any) {
  //   this.isProgressBarVisibile = true;
  //   var file: File;
  //   this._capaService.ViewResponseItem(Reqitem.ReqID, Reqitem.ReqItemID, this.currentUserName).subscribe(
  //     async (data) => {
  //       if (data == null) {
  //         this.isProgressBarVisibile = false;
  //         this.ResponseItem(Reqitem);
  //       }
  //       else {
  //         const item = data as CAPAResItemView;
  //         if (item.AttachmentID > 0) {
  //           const base64Response = await fetch(`data:${item.ContentType};base64,${item.AttachmentFile}`);
  //           const blobs = await base64Response.blob();
  //           let fileType = 'image/jpg';
  //           fileType = item.AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //             item.AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //               item.AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
  //                 item.AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' :
  //                   item.AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
  //           const blob = new Blob([blobs], { type: fileType });

  //           file = new File([blob], item.AttachmentName, { type: fileType })
  //           const files = new CAPADialogResponseFiles();
  //           files.ReqItemID = item.ReqItemID;
  //           files.PatnerID = this.currentUserName;
  //           files.Files = file;
  //           this.FileUploadList.push(files);
  //         }

  //         var Resitem = new CAPAResItem();
  //         Resitem.ReqID = this.SelectedID;
  //         Resitem.ReqItemID = item.ReqItemID;
  //         Resitem.PartnerID = this.currentUserName;
  //         Resitem.Text = item.Text;
  //         Resitem.Status = item.Status;
  //         Resitem.DueDate = new Date(item.DueDate)
  //         this.ResponseDetails.CAPAResItems.forEach((Responseitems, index) => {
  //           if (Responseitems.ReqItemID == item.ReqItemID) {
  //             this.ResponseDetails.CAPAResItems.splice(index, 1);
  //           }
  //         });
  //         this.ResponseDetails.CAPAResItems.push(Resitem);
  //         this.isProgressBarVisibile = false;
  //         if (Resitem.Status != "Open") {
  //           this.ResponseItem(Reqitem, true);
  //         }
  //         else {
  //           this.ResponseItem(Reqitem);
  //         }
  //         // var DialogData = new CAPADialogResponse();
  //         // DialogData.Text = item.Text;
  //         // DialogData.DueDate = new Date(item.DueDate)
  //         // DialogData.Status = item.Status;
  //         // if (this.Type == 'Respond' || this.Type == 'Accept') {
  //         //   DialogData.ActionStatus = "View"
  //         // }
  //         // if (item.AttachmentID > 0) {
  //         //   DialogData.Files = file;
  //         // }

  //         // const dialogConfig: MatDialogConfig = {
  //         //   data: DialogData,
  //         //   panelClass: "capa-response-dialog",
  //         //   disableClose: true
  //         // };

  //         // this.isProgressBarVisibile = false;

  //         // const dialogRef = this.dialog.open(
  //         //   CapaResponseDialogComponent,
  //         //   dialogConfig
  //         // );

  //         // dialogRef.afterClosed().subscribe(
  //         //   (result) => {
  //         //     if (result) {
  //         //       var response = result as CAPADialogResponse;
  //         //       //Items
  //         //       var Resitem = new CAPAResItem();
  //         //       Resitem.ReqID = this.SelectedID;
  //         //       Resitem.ReqItemID = item.ReqItemID;
  //         //       Resitem.PartnerID = this.currentUserName;
  //         //       Resitem.Text = response.Text;
  //         //       Resitem.Status = response.Status;
  //         //       Resitem.DueDate = response.DueDate;
  //         //       this.ResponseDetails.CAPAResItems.forEach((Responseitems, index) => {
  //         //         if (Responseitems.ReqItemID == item.ReqItemID) {
  //         //           this.ResponseDetails.CAPAResItems.splice(index, 1);
  //         //         }
  //         //       });
  //         //       this.ResponseDetails.CAPAResItems.push(Resitem);

  //         //       //Files
  //         //       if (response.Files) {
  //         //         var files = new CAPADialogResponseFiles();
  //         //         files.ReqItemID = item.ReqItemID;
  //         //         files.Files = response.Files;
  //         //         files.PatnerID = this.currentUserName;
  //         //         this.FileUploadList.forEach((Responsefiles, index) => {
  //         //           if (Responsefiles.ReqItemID == item.ReqItemID) {
  //         //             this.FileUploadList.splice(index, 1);
  //         //           }
  //         //         });
  //         //         this.FileUploadList.push(files);
  //         //       }
  //         //       console.log("this.ResponseDetails", this.ResponseDetails);
  //         //     }
  //         //   }
  //         // );
  //       }
  //     },
  //     (err) => {
  //       this.isProgressBarVisibile = false;
  // this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
  //     }
  //   );
  // }
  ResponseItem(item: any, Action = false, IsDocumentRequried = null) {
    var DialogData = new CAPADialogResponse();
    DialogData.MinDate = new Date(this.SelectedVendor.StartDate);

    if (IsDocumentRequried != null) {
      DialogData.IsDocumentRequried = IsDocumentRequried;
    }
    else {
      DialogData.IsDocumentRequried = item.IsDocumentRequired;
    }

    if (this.ResponseDetails.CAPAResItems.length > 0) {
      this.ResponseDetails.CAPAResItems.forEach(details => {
        if (details.ReqItemID === item.ReqItemID) {
          DialogData.Text = details.Text;
          DialogData.DueDate = details.DueDate;
          DialogData.Status = details.Status;
          DialogData.MinDate = new Date(this.SelectedVendor.StartDate);
          if (this.Type == 'Respond' && Action) {
            DialogData.ActionStatus = "View";
          }
          else if (this.Type == 'Accept') {
            DialogData.ActionStatus = "View";
          }
          else if (this.Type == 'Others') {
            DialogData.ActionStatus = "View";
          }
          else {
            DialogData.ActionStatus = "Show";
          }
        }
      });
      this.FileUploadList.forEach(files => {
        if (files.ReqItemID === item.ReqItemID) {
          DialogData.Files = files.Files;
        }
      });
    }

    console.log('Dialog Data sent to dialog', DialogData);
    const dialogConfig: MatDialogConfig = {
      data: DialogData,
      panelClass: "capa-response-dialog",
      disableClose: true
    };
    const dialogRef = this.dialog.open(
      CapaResponseDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          console.log('Dialog response', result)
          var response = result as CAPADialogResponse;
          //Items
          var Resitem = new CAPAResItem();
          Resitem.ReqID = this.SelectedID;
          Resitem.ReqItemID = item.ReqItemID;
          Resitem.PartnerID = this.currentUserName;
          Resitem.Text = response.Text;
          Resitem.Status = response.Status;

          if (response.DueDate == null || response.DueDate.toString() == "") {
            Resitem.DueDate = this._datePipe.transform(this.HeaderFormGroup.get('DueDate').value, 'yyyy-MM-dd')
          }
          else {
            Resitem.DueDate = response.DueDate;
          }
          this.ResponseDetails.CAPAResItems.forEach((Responseitems, index) => {
            if (Responseitems.ReqItemID == item.ReqItemID) {
              this.ResponseDetails.CAPAResItems.splice(index, 1);
            }
          });
          this.ResponseDetails.CAPAResItems.push(Resitem);

          //Files
          if (response.Files) {
            var files = new CAPADialogResponseFiles();
            files.ReqItemID = item.ReqItemID;
            files.Files = response.Files;
            files.PatnerID = this.currentUserName;
            this.FileUploadList.forEach((Responsefiles, index) => {
              if (Responsefiles.ReqItemID === item.ReqItemID) {
                this.FileUploadList.splice(index, 1);
              }
            });
            this.FileUploadList.push(files);
          }
          console.log("this.ResponseDetails", this.ResponseDetails, this.FileUploadList);
        }
        // else {
        //   if (this.Type == "Reject") {
        //     if (this.ResponseDetails.CAPAResItems.length > 0) {
        //       this.ResponseDetails.CAPAResItems.pop();
        //     }
        //   }
        // }
      });
  }
  SubmitClicked(action: any) {
    this.GetHeaderDetails();
    console.log(this.ResponseDetails, this.ResponseDetails.CAPAResItems, this.FileUploadList);
    if (this.ResponseDetails.CAPAResItems.length === this.ItemList.length) {
      var index = this.ResponseDetails.CAPAResItems.findIndex(x => x.Status === "Reject" || x.Status === "Open");
      if (index >= 0) {
        this.notificationSnackBarComponent.openSnackBar("Please Responed To  Item", SnackBarStatus.danger);
      }
      else {
        this.openConfirmationDialog(action);
      }
    }
    else {
      // var IsItemIndex = this.ResponseDetails.CAPAResItems.findIndex(x => x.ReqItemID == this.ItemList[0].ReqItemID);
      // if (IsItemIndex != -1) {
      //   var index = this.ResponseDetails.CAPAResItems.findIndex(x => x.Status === "Reject" || x.Status === "Open");
      //   if (index >= 0) {
      //     this.notificationSnackBarComponent.openSnackBar("Please Responed To  Item", SnackBarStatus.danger);
      //   }
      //   else {
      //     this.openConfirmationDialog(action);
      //   }
      // }
      // else {
      this.notificationSnackBarComponent.openSnackBar("Please Responed To All Items", SnackBarStatus.danger);
      // }
    }
  }
  CreateCAPAResponse() {
    this.isProgressBarVisibile = true;
    this._capaService.CreateCAPAResponse(this.ResponseDetails).subscribe(
      (response) => {
        var count = 0;
        if (this.FileUploadList.length > 0) {
          this.FileUploadList.forEach(files => {
            this._capaService.UploadOfAttachment(files, this.SelectedID).subscribe(
              (AttachmentResponse) => {
                // console.log("AttachmentResponse", AttachmentResponse);
                count = count + 1;
                if (count == this.FileUploadList.length) {
                  this.isProgressBarVisibile = false;
                  if (this.Type === "Reject" || this.Type === "Respond") {
                    this.Type = "Others";
                  }
                  this.notificationSnackBarComponent.openSnackBar("CAPA Response Success", SnackBarStatus.success);
                }
              },
              (err) => {
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.success);
              }
            );
          });
        }
        else {
          this.isProgressBarVisibile = false;
          if (this.Type === "Reject" || this.Type === "Respond") {
            this.Type = "Others";
          }
          this.notificationSnackBarComponent.openSnackBar("CAPA Response Success", SnackBarStatus.success);
        }
      },
      (err) => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);

        // console.log(err);
      }
    );
  }
  GetHeaderDetails() {
    // this.ResponseDetails.ReqID = this.SelectedID;
    // this.ResponseDetails.PartnerID = this.currentUserName;
    // this.ResponseDetails.Text = this.HeaderFormGroup.get('Text').value;
    // this.ResponseDetails.DueDate = this.HeaderFormGroup.get('DueDate').value;
    // this.ResponseDetails.Status = "Respond";
  }
  openConfirmationDialog(Actiontype: string, Catagory = "CAPA Response"): void {
    // if (Actiontype == "Open") {
    //   Actiontype = "Submit";
    // }
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.CreateCAPAResponse();
        }
      });
  }
  // SetUserPreference(): void {
  //   this._fuseConfigService.config
  //     .subscribe((config) => {
  //       this.fuseConfig = config;
  //       this.BGClassName = config;
  //     });
  //   // this._fuseConfigService.config = this.fuseConfig;
  // }
}
