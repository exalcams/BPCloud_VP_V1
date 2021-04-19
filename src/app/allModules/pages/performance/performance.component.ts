import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NgImageSliderComponent } from 'ng-image-slider';
@Component({
  selector: "app-performance",
  templateUrl: "./performance.component.html",
  styleUrls: ["./performance.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class PerformanceComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  menuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  sliderArray: any[] = [];
  transform: number;
  selectedIndex = 0;
  @ViewChild('nav') slider: NgImageSliderComponent;
  imageObject = [{
    image: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/5.jpg',
    thumbImage: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/5.jpg',
    // title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    //   + 'Lorem Ipsum has been the industry standard dummy'
  }, {
    image: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/9.jpg',
    thumbImage: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/9.jpg'
  }, {
    image: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/4.jpg',
    thumbImage: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/4.jpg',
    // title: 'Example with title.'
  }, {
    image: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/7.jpg',
    thumbImage: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/7.jpg',
    // title: 'Hummingbirds are amazing creatures'
  }, {
    image: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/1.jpg',
    thumbImage: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/1.jpg'
  }, {
    image: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/2.jpg',
    thumbImage: 'https://sanjayv.github.io/ng-image-slider/contents/assets/img/slider/2.jpg',
    // title: 'Example two with title.'
  }];
  // imageObject: Array<object> = [];
  // imageObject: Array<object> = [{
  //   image: 'assets/imgages/backgrounds/BPCloudBG.png',
  //   thumbImage: 'assets/imgages/backgrounds/BPCloudBG.png',
  //   alt: 'alt of image',
  //   title: 'title of image'
  // }
  // {
  //   image: '.../iOe/xHHf4nf8AE75h3j1x64ZmZ//Z==', // Support base64 image
  //   thumbImage: '.../iOe/xHHf4nf8AE75h3j1x64ZmZ//Z==', // Support base64 image
  //   title: 'Image title', // Optional: You can use this key if want to show image with title
  //   alt: 'Image alt' // Optional: You can use this key if want to show image with alt
  // }
  // ];

  constructor(
    private _router: Router,
    public snackBar: MatSnackBar,
  ) {
    this.sliderArray = [
      { img: 'http://bloquo.cc/img/works/1.jpg', alt: '', text: '365 Days Of weddings a year' },
      { img: 'http://bloquo.cc/img/works/2.jpg', alt: '', text: '365 Days Of weddings a year' },
      { img: 'http://bloquo.cc/img/works/3.jpg', alt: '', text: '365 Days Of weddings a year' },
      { img: 'http://bloquo.cc/img/works/4.jpg', alt: '', text: '365 Days Of weddings a year' },
      { img: 'http://bloquo.cc/img/works/5.jpg', alt: '', text: '365 Days Of weddings a year' }
    ];
    // this.imageObject = [{
    //   image: 'assets/images/backgrounds/BPCloudBG.png',
    //   thumbImage: 'assets/images/backgrounds/BPCloudBG.png',
    //   alt: 'alt of image',
    //   title: 'title of image'
    // }];
  }

  ngOnInit(): void {
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.menuItems.indexOf('Performance') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }
    } else {
      // this._router.navigate(['/auth/login']);
    }
  }

  prevImageClick(): void {
    this.slider.prev();
  }

  nextImageClick(): void {
    this.slider.next();
  }


  selected(x): void {
    this.downSelected(x);
    this.selectedIndex = x;
  }

  keySelected(x): void {
    this.downSelected(x);
    this.selectedIndex = x;
  }

  downSelected(i): void {
    this.transform = 100 - (i) * 50;
    this.selectedIndex = this.selectedIndex + 1;
    if (this.selectedIndex > 4) {
      this.selectedIndex = 0;
    }
  }

  // getSliderArray(): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.getSliderArray().subscribe(
  //     (data) => {
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

}
