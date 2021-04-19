import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AttachmentDetails } from 'app/models/task';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';

@Component({
  selector: 'app-asn-print-dialog',
  templateUrl: './asn-print-dialog.component.html',
  styleUrls: ['./asn-print-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AsnPrintDialogComponent implements OnInit {

  public AttachmentData: any;
  constructor(
    public matDialogRef: MatDialogRef<AttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public attachmentDetails: AttachmentDetails,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    const fileURL = URL.createObjectURL(this.attachmentDetails.blob);
    this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    // this.AttachmentData = fileURL;
    // console.log(this.AttachmentData);
  }

  CloseClicked(): void {
    this.matDialogRef.close(null);
  }
}
