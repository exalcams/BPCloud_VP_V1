import { Injectable } from '@angular/core';
import { ASNListView } from 'app/models/ASN';
import { BPCPODView } from 'app/models/POD';

@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentInvoiceDetail: any;
  public CurrentASNListView: ASNListView;
  public CurrentPODView: BPCPODView;
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
  SetPODView(podView: BPCPODView): void {
    this.CurrentPODView = podView;
  }
  GetPODView(): BPCPODView {
    return this.CurrentPODView;
  }
}
