import { Injectable } from '@angular/core';
import { ASNListView } from 'app/models/ASN';

@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentInvoiceDetail: any;
  public CurrentASNListView: ASNListView;
  constructor() { }
  SetInvoiceDetail(InvoiceDetail: any): void {
    this.CurrentInvoiceDetail = InvoiceDetail;
  }
  GetInvoiceDetail(): any {
    return this.CurrentInvoiceDetail;
  }
  SetASNListView(asnListView: ASNListView): void {
    this.CurrentASNListView = asnListView;
  }
  GetASNListView(): ASNListView {
    return this.CurrentASNListView;
  }
}
