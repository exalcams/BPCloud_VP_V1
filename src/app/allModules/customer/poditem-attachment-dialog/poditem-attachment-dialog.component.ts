import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { fuseAnimations } from '@fuse/animations';
import { AttachmentFiles } from 'app/models/POD';
import { PODService } from 'app/services/pod.service';

@Component({
  selector: 'app-poditem-attachment-dialog',
  templateUrl: './poditem-attachment-dialog.component.html',
  styleUrls: ['./poditem-attachment-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PODItemAttachmentDialogComponent implements OnInit {
  IsProgressBarVisibile: boolean;
  constructor(
    public matDialogRef: MatDialogRef<PODItemAttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public attachmentFiles: AttachmentFiles,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _PODService: PODService,
  ) {
    this.IsProgressBarVisibile = false;
  }

  ngOnInit(): void {
    if (!this.attachmentFiles.files || !this.attachmentFiles.files.length) {
      this.attachmentFiles.files = [];
    }
    if (!this.attachmentFiles.fileNames || !this.attachmentFiles.fileNames.length) {
      this.attachmentFiles.fileNames = [];
    }
  }

  GetPODItemAttachment(fileName: string): void {
    if (this.attachmentFiles.files && this.attachmentFiles.files.length) {
      const file = this.attachmentFiles.files.filter(x => x.name === fileName)[0];
      if (file && file.size) {
        const blob = new Blob([file], { type: file.type });
        this.OpenAttachmentDialog(file.name, blob);
      } else {
        this.IsProgressBarVisibile = true;
        this.DowloandPODItemAttachment(fileName);
      }
    } else {
      this.DowloandPODItemAttachment(fileName);
    }

  }
  DowloandPODItemAttachment(fileName: string): void {
    this._PODService.DowloandPODItemAttachment(this.attachmentFiles.Item, fileName).subscribe(
      data => {
        if (data) {
          let fileType = 'image/jpg';
          fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
            fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
              fileName.toLowerCase().includes('.png') ? 'image/png' :
                fileName.toLowerCase().includes('.gif') ? 'image/gif' :
                  fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
          const blob = new Blob([data], { type: fileType });
          this.OpenAttachmentDialog(fileName, blob);
        }
        this.IsProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  RemoveItemAttachment(fileName: string): void {
    if (this.attachmentFiles.files && this.attachmentFiles.files.length) {
      const index = this.attachmentFiles.files.findIndex(x => x.name === fileName);
      if (index >= 0) {
        this.attachmentFiles.files.splice(index, 1);
      }
    }
    if (this.attachmentFiles.fileNames && this.attachmentFiles.fileNames.length) {
      const index = this.attachmentFiles.fileNames.findIndex(x => x === fileName);
      if (index >= 0) {
        this.attachmentFiles.fileNames.splice(index, 1);
      }
    }
  }
  // attachmentClicked(): void {
  //   if (this.file && this.file.size) {
  //     let fileType = 'image/jpg';
  //     fileType = this.file.name.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //       this.file.name.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //         this.file.name.toLowerCase().includes('.png') ? 'image/png' :
  //           this.file.name.toLowerCase().includes('.gif') ? 'image/gif' :
  //             this.file.name.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
  //     const blob = new Blob([this.file], { type: fileType });
  //     this.OpenAttachmentDialog(this.file.name, blob);
  //   }
  // }

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
      const fil = evt.target.files[0] as File;
      this.attachmentFiles.files.push(fil);
      this.attachmentFiles.fileNames.push(fil.name);
    }
  }

  YesClicked(): void {
    // const blob = new Blob([this.file], { type: this.file.type });
    this.matDialogRef.close(this.attachmentFiles);
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }
}

