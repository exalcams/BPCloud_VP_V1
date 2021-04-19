import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-socc-dialog',
  templateUrl: './socc-dialog.component.html',
  styleUrls: ['./socc-dialog.component.scss']
})
export class SoccDialogComponent implements OnInit {
  AttachmentData: any;
  count = 0;
  public screenWidth: any;
  public screenHeight: any;
  dialog;
  // private sanitizer: DomSanitizer;
  constructor(private sanitizer: DomSanitizer) { }
  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl("/assets/SOC.pdf");

    this.screenHeight = window.innerHeight;
    this.dialog = document.getElementById("DialogContent");
    this.screenWidth = this.dialog.offsetWidth;
    console.log(this.screenWidth, this.screenHeight);
  }
  getIframeStyle(): any {
    this.count = 1;
    return {
      height: this.screenHeight + "px",
      width: this.screenWidth + "px"
    };
  }
  getWidth(): string {
    return this.screenWidth - 50 + "px";
  }
  getHeight(): string {
    return this.screenHeight - 60 + "px";
  }
}
