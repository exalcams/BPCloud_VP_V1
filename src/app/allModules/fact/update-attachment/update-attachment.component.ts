import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { BPCInvoiceAttachment } from 'app/models/ASN';
import { OfAttachmentData } from 'app/models/OrderFulFilment';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';

@Component({
  selector: 'app-update-attachment',
  templateUrl: './update-attachment.component.html',
  styleUrls: ['./update-attachment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UpdateAttachmentComponent implements OnInit {
  filename: any;
  isProgressBarVisibile: boolean;
  fileToUpload: any;
  file: File;
  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public attachmentDetails: AttachmentDetails,
    public matDialogRef: MatDialogRef<UpdateAttachmentComponent>,
    private sanitizer: DomSanitizer) {
    this.isProgressBarVisibile = false;
  }

  ngOnInit(): void {
    this.fileToUpload = null;
  }

  openAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }
  handleFileInputCertificate(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.file = evt.target.files[0];
    }
  }
  Save(): void {
    this.fileToUpload = this.file;
  }
  close(): void {
    this.matDialogRef.close(this.fileToUpload);
  }
}
