import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-poditem-attachment-dialog',
  templateUrl: './poditem-attachment-dialog.component.html',
  styleUrls: ['./poditem-attachment-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PODItemAttachmentDialogComponent implements OnInit {
  constructor(
    public matDialogRef: MatDialogRef<PODItemAttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: File | null,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,

  ) {

  }

  ngOnInit(): void {
  }

  attachmentClicked(): void {
    if (this.file && this.file.size) {
      let fileType = 'image/jpg';
      fileType = this.file.name.toLowerCase().includes('.jpg') ? 'image/jpg' :
        this.file.name.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
          this.file.name.toLowerCase().includes('.png') ? 'image/png' :
            this.file.name.toLowerCase().includes('.gif') ? 'image/gif' :
              this.file.name.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
      const blob = new Blob([this.file], { type: fileType });
      this.OpenAttachmentDialog(this.file.name, blob);
    }
  }
  OpenAttachmentDialog(FileName: string, blob: Blob): void {
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

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.file = evt.target.files[0];
    }
  }

  YesClicked(): void {
    const blob = new Blob([this.file], { type: this.file.type });
    this.matDialogRef.close(this.file);
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }
}

