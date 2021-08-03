import { CommonClass } from './common';
import { BPCPayPayment } from './Payment.model';
export class BPCPIHeader extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    PIRNumber: string;
    PIRType: string;
    DocumentNumber: string;
    Text: string;
    Date: Date | string | null;
    ReferenceDoc: string;
    Currency: string;
    Status: string;
    GrossAmount: number | null;
    NetAmount: number | null;
    UOM: string;
    Material: string;
    Description: string;
    Qty: number;
    Reason: string;
    DeliveryNote: string;
}

export class BPCPIItem extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    PIRNumber: string;
    DocumentNumber: string;
    Item: string;
    ProdcutID: string;
    MaterialText: string;
    DeliveryDate: Date | string | null;
    OrderQty: number;
    UOM: string;
    HSN: string;
    RetQty: number;
    ReasonText: string;
    FileName: string;
    AttachmentReferenceNo: string;
    Material: string;
}

export class BPCPIView extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    PIRNumber: string;
    PIRType: string;
    DocumentNumber: string;
    Text: string;
    Date: Date | string | null;
    ReferenceDoc: string;
    Currency: string;
    Status: string;
    GrossAmount: number | null;
    NetAmount: number | null;
    UOM: string;
    Items: BPCPIItem[];
}

export class BPCRetHeader extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    Text: string;
    Date: Date | string | null;
    InvoiceDoc: string;
    Status: string;
    TruckNumber: string;
    Transporter: string;
    AWBNumber: string;
    CreditNote: string;
    DocumentNumber: string;

}

export class BPCRetItem extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    Item: string;
    ProdcutID: string;
    MaterialText: string;
    Material: string;
    InvoiceNumber: string;
    OrderQty: number;
    RetQty: number;
    ReasonText: string;
    FileName: string;
    AttachmentReferenceNo: string;
}
export class BPCRetItemBatch extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    Item: string;
    Batch: string;
    RetQty: number;

}
export class BPCRetItemSerial extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    Item: string;
    Serial: string;
    RetQty: number;

}

export class BPCRetView extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    DocumentNumber: string;
    CreditNote: string;
    AWBNumber: string;
    Transporter: string;
    TruckNumber: string;
    Text: string;
    Date: Date | string | null;
    InvoiceDoc: string;
    Status: string;
    Items: BPCRetItemView[];
}
// tslint:disable-next-line:class-name
export class BPCRetView_new extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    DocumentNumber: string;
    CreditNote: string;
    TruckNumber: string;
    Transporter: string;
    AWBNumber: string;
    Text: string;
    Date: Date | string | null;
    InvoiceDoc: string;
    Status: string;
    Items: BPCRetItem[];
    Batch: BPCRetItemBatch[];
    Serial: BPCRetItemSerial[];
}
export class BPCRetItemView extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    RetReqID: string;
    Item: string;
    ProdcutID: string;
    Material: string;
    MaterialText: string;
    InvoiceNumber: string;
    OrderQty: number;
    RetQty: number;
    ReasonText: string;
    FileName: string;
    AttachmentReferenceNo: string;
    Batches: BPCRetItemBatch[];
    Serials: BPCRetItemSerial[];
    constructor() {
        super();
        this.Batches = [];
        this.Serials = [];
    }
}
// export class BPCRetView1 extends CommonClass {
//     Client: string;
//     Company: string;
//     Type: string;
//     PatnerID: string;
//     RetReqID: string;
//     DocumentNumber: string;
//     CreditNote: string;
//     AWBNumber: string;
//     Transporter: string;
//     TruckNumber: string;
//     Text: string;
//     Date: Date | string | null;
//     InvoiceDoc: string;
//     Status: string;
//     Items: BPCRetItemView1[];
// }
export class BPCProd extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    ProductID: string;
    MaterialText: string;
    MaterialType: string;
    MaterialGroup: string;
    HSN: string;
    AttID: string;
    UOM: string;
    Stock: string;
    BasePrice: string;
    StockUpdatedOn: Date | string | null;
}
export class BPCProdFav extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    ProductID: string;
    PatnerID: string;
    Material: string;
    Rating: number;

}
export class SODetails {
    ID: number;
    PatnerID: string;
    SO: string;
    PIRNumber: string;
    PIRType: string;
    SODate: Date | string | null;
    Status: string;
    Document: string;
    Version: string;
    Currency: string;
    DocCount: number;
}

export class BPCInvoicePayment extends CommonClass {
    // ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    InvoiceNo: string;
    InvoiceDate: Date;
    InvoiceAmount: number;
    PoReference: string;
    PaidAmount: number;
    Currency: string;
    DateofPayment: Date;
    Status: string;
    AttID: string;
    PODDate: Date;
    PODConfirmedBy: string;
    AWBNumber: string;
    BalanceAmount: number;

}
export class BPCInvoicePayView extends CommonClass {
    ID: number;
    Invoices: BPCInvoicePayment[];
    PayRecord: BPCPayRecord[];
    PayPayment: BPCPayPayment[];
}


export class BPCPayRecord extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PartnerID: string;
    InvoiceNumber: string;
    DocumentNumber: string;
    PaymentDate: Date;
    PayRecordNo: string;
    UOM: string;
    PaidAmount: number;
    Medium: string;
    Time: string;
    Remarks: string;
    RefNumber: string;
    PayDoc: string;
}
