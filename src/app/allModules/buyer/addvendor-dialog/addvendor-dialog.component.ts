import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BPCFact, CAPAvendor } from 'app/models/fact';
import { AttachmentDetails } from 'app/models/task';

@Component({
  selector: 'app-addvendor-dialog',
  templateUrl: './addvendor-dialog.component.html',
  styleUrls: ['./addvendor-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AddvendorDialogComponent implements OnInit {
  SelectedVendors: BPCFact[] = [];
  facts: BPCFact[] = [];
  FactsView: BPCFact[] = [];
  SearchText = "";
  DisableSelect: boolean;
  ofStatusOptions = ["1", "2", "3", "4", "5"];
  constructor(private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public vendorDetails: CAPAvendor,
    public matDialogRef: MatDialogRef<AddvendorDialogComponent>) { }

  ngOnInit() {
    console.log(this.vendorDetails, this.SelectedVendors);
    this.LoadvendorDetails();
  }
  ListSelected(Event: any) {
    const fact = Event.option.value as BPCFact;
    const findIndex = this.SelectedVendors.findIndex(x => x == fact);
    if (findIndex >= 0) {
      this.SelectedVendors.splice(findIndex, 1);
    }
    else {
      this.SelectedVendors.push(Event.option.value);
    }
    console.log("ListSelected", this.SelectedVendors);
  }
  closeDialog() {
    this.matDialogRef.close(false);
  }
  LoadvendorDetails() {
    this.vendorDetails.Vendors.forEach((element, index) => {
        this.facts.push(element);
        this.FactsView.push(element);
    });
    this.vendorDetails.SelectedVendors.forEach(element => {
      this.SelectedVendors.push(element);
    });
    this.DisableSelect = !this.vendorDetails.Action;
    if (this.DisableSelect) {
      this.vendorDetails.Vendors.forEach(element => {
        this.SelectedVendors.push(element);
      });
    }
    console.log("LoadvendorDetails", this.facts);
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // this.facts. = filterValue.trim().toLowerCase();
  }
  SearchList() {
    var city = "";
    var partnerid = "";
    var matchedIndex = [];
    if (this.SearchText != "") {
      this.facts.forEach((element, index) => {
        if (element.City != null) {
          city = element.City.toString();
        }
        if (element.PatnerID != null) {
          partnerid = element.PatnerID.toString();
        }
        if (partnerid != "" && partnerid.includes(this.SearchText) || city != "" && city.includes(this.SearchText)) {
          const obj = {
            PatnerID: element.PatnerID,
            Type: element.Type,
            Company:element.Company
          }
          matchedIndex.push(obj);
        }
      });
      if (matchedIndex.length > 0) {
        this.facts = [];
      }
      for (var i = 0; i < matchedIndex.length; i++) {
        var FactIndex = this.FactsView.findIndex(x => x.PatnerID == matchedIndex[i].PatnerID && x.Type == matchedIndex[i].Type && x.Company == matchedIndex[i].Company);
        this.facts.push(this.FactsView[FactIndex]);
      }
    }
    else {
      this.facts = [];
      this.FactsView.forEach(element => {
        this.facts.push(element);
      });
    }
  }
  Transfer(): void {
    this.matDialogRef.close(this.SelectedVendors);

  }
}
