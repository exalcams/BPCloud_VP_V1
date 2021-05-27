import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { BPCProd, BPCProdFav } from 'app/models/customer';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { MasterService } from 'app/services/master.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  isProgressBarVisibile:boolean;
  searchText='';
  ProductsFormGroup:FormGroup;
  AllProducts: BPCProd[]=[];
  selectedProduct:BPCProd;
  authenticationDetails: AuthenticationDetails;
  menuItems: string[];
  ProductFav:BPCProdFav;
  selectID: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  selectedValue_star: any;
  stars: number[] = [1, 2, 3, 4, 5];
  patnerId: string;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    )  {
      this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
      this.selectedProduct=new BPCProd();
      this.ProductFav=new BPCProdFav();
      this.authenticationDetails = new AuthenticationDetails();
      this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
      this.isProgressBarVisibile = true;
     }

  ngOnInit() {
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    this.patnerId=this.authenticationDetails.UserName;
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('Doctype') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializeProductsFormGroup();
      this.GetAllProducts();
    } else {
      this._router.navigate(['/auth/login']);
    }

  this.InitializeProductsFormGroup();
  this.GetAllProducts();
  }
  InitializeProductsFormGroup(): void {
    this.ProductsFormGroup = this._formBuilder.group({
      MaterialGroup: ['', Validators.required],
      MaterialText: ['', Validators.required],
      Material: ['', Validators.required],
      Stock: ['', Validators.required],
      BasePrice: ['', Validators.required],
      Favourite:[0]
    });
  }
  GetAllProducts(){
    var data=this._masterService.GetAllProducts().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllProducts = <BPCProd[]>data;
        console.log("prod",this.AllProducts);
        if (this.AllProducts && this.AllProducts.length) {
          this.loadSelectedProduct(this.AllProducts[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    )
  }
  loadSelectedProduct(selectedproduct: BPCProd): void {
    this.selectID = selectedproduct.ProductID;
    this.selectedProduct = selectedproduct;
    this.SetProductValues();
  }
  SetProductValues(): void {
    this.ProductsFormGroup.get('MaterialGroup').patchValue(this.selectedProduct.MaterialGroup);
    this.ProductsFormGroup.get('MaterialText').patchValue(this.selectedProduct.MaterialText);
    this.ProductsFormGroup.get('Material').patchValue(this.selectedProduct.Material);
    this.ProductsFormGroup.get('Stock').patchValue(this.selectedProduct.Stock);
    this.ProductsFormGroup.get('BasePrice').patchValue(this.selectedProduct.BasePrice);
  }
  ResetControl(): void {
    this.selectedProduct = new BPCProd();
    this.selectID = '';
    this.ProductsFormGroup.reset();
    
    Object.keys(this.ProductsFormGroup.controls).forEach(key => {
      this.ProductsFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  ShowValidationErrors(): void {
    Object.keys(this.ProductsFormGroup.controls).forEach(key => {
      this.ProductsFormGroup.get(key).markAsTouched();
      this.ProductsFormGroup.get(key).markAsDirty();
    });

  }
  CreateProduct(): void {
    this.GetProductValues();
    this.selectedProduct.Client="001";
    this.selectedProduct.Company="0002";
    this.selectedProduct.ProductID="600";
    this.selectedProduct.AttID="1";
    this.selectedProduct.Type="C";
    this.selectedProduct.CreatedBy= this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreateProduct(this.selectedProduct).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Product created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllProducts();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
   this.createFav();
  }
createFav(){
  this.ProductFav.CreatedBy=this.authenticationDetails.UserID.toString();
  this.ProductFav.Rating=this.selectedValue_star;
  this.ProductFav.Client=this.selectedProduct.Client;
  this.ProductFav.Company=this.selectedProduct.Company;
  this.ProductFav.Type=this.selectedProduct.Type;
  this.ProductFav.Material=this.selectedProduct.Material;
  this.ProductFav.ProductID=this.selectedProduct.ProductID;
  this.ProductFav.PatnerID=this.patnerId;
}
  UpdateProduct(): void {
    this.GetProductValues();
    this.selectedProduct.ModifiedBy= this.authenticationDetails.UserID.toString();
    
    this.isProgressBarVisibile = true;
    this._masterService.UpdateProduct(this.selectedProduct).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Product updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllProducts();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }
  GetProductValues(){
    this.selectedProduct.Material = this.ProductsFormGroup.get('Material').value;
    this.selectedProduct.MaterialText= this.ProductsFormGroup.get('MaterialText').value;
    this.selectedProduct.MaterialGroup = this.ProductsFormGroup.get('MaterialGroup').value;
    this.selectedProduct.Stock = this.ProductsFormGroup.get('Stock').value;
    this.selectedProduct.BasePrice= this.ProductsFormGroup.get('BasePrice').value;
    console.log(this.selectedProduct);
  }
  DeleteProduct(): void {
    this.GetProductValues();
    this.selectedProduct.ModifiedBy= this.authenticationDetails.UserID.toString();
  
    this.isProgressBarVisibile = true;
    this._masterService.DeleteProduct(this.selectedProduct).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Product deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllProducts();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  SaveClicked(): void {
    if (this.ProductsFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedProduct.ProductID) {
        const Actiontype = 'Update';
        const Catagory = 'Products';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Products';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
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
          if (Actiontype === 'Create') {
            this.CreateProduct();
          } else if (Actiontype === 'Update') {
           this.UpdateProduct();
          } else if (Actiontype === 'Delete') {
           this.DeleteProduct();
          }
        }
      });
  }
  DeleteClicked(): void {
    if (this.ProductsFormGroup.valid) {
      if (this.selectedProduct.ProductID) {
        const Actiontype = 'Delete';
        const Catagory = 'Products';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  countStar(star) {
    this.selectedValue_star = star;
    this.ProductsFormGroup.get('Favourite').setValue(star);
    console.log(this.ProductsFormGroup.get('Favourite').value);
  }

addClass_fav(star) {
  //  console.log("star", star); 
  //  console.log("selectedvalue", this.selectedValue);
   let ab = "";
   for (let i = 0; i < star; i++) {
     
     ab = "starId" + i;
     document.getElementById(ab).classList.add("selected");
   }
}
removeClass_fav(star) {
  //  console.log("removestar", star);
   let ab = "";
  for (let i = star-1; i >= this.selectedValue_star; i--) {
    //  console.log("star i", star);
     ab = "starId" + i;
     document.getElementById(ab).classList.remove("selected");
   }
}
}
