import { CommonClass } from './common';

export class BPCInvoice extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    InvoiceNo: string;
    InvoiceDate: Date | string | null;
    PostingDate: Date | string | null;
    ASN: string;
    Plant: string;
    ASNDATE: Date | string | null;
    InvoiceAmount: number;
    PoReference: string;
    PaidAmount: number;
    Currency: string;
    DateofPayment: Date | string | null;
    Status: string;
    AttID: string;
    PODDate: Date | string | null;
    PODConfirmedBy: string;
}

export class BPCInvoiceItem extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    InvoiceNo: string;
    Item: string;
    Material: string;
    MaterialText: string;
    InvoiceQty: number;
    PODQty: number;
    ReasonCode: string;
    Status: string;
}

export class BPCPayment extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    PaymentDoc: string;
    Date: Date | string | null;
    Amount: number;
    Currency: string;
    Remark: string;
    Attachment: string;
}

export class BPCInvoiceXLSX {
    Company: string;
    Patnerid: string;
    Fiscalyear: string;
    Invno: string;
    Paidamt: number;
    Currency: string;
    Dateofpayment: string;
    Poddate: string;
}

export class BPCPaymentXLSX {
    Company: string;
    Type: string;
    Patnerid: string;
    Fiscalyear: string;
    Paydoc: string;
    Date: string;
    Amount: number;
    Currency: string;
}

export class BPCReportPPMHeader extends CommonClass {
    Id: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Period: Date;
    Material: string;
    MaterialText: string;
    ReceiptQty: number;
    RejectedQty: number;
    PPM: number;
}

export class BPCReportPPMItem extends CommonClass {
    Id: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Period: Date | string | null;
    Material: string;
    MaterialText: string;
    ReceiptQty: number;
    RejectedQty: number;
    PPM: number;
}

export class BPCReportOV extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Material: string;
    GRR: string;
    MaterialText: string;
    InputQty: number;
    AccQty: number;
    RejQty: number;
    RejPercentage: number;
    Status: string;
}

export class PPMReportOption extends CommonClass {
    PartnerID: string;
    Material: string;
    PO: string;
    Status: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
}

export class OverviewReportOption extends CommonClass {
    PartnerID: string;
    Material: string;
    PO: string;
    Status: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
}

export class BPCReportDOL extends CommonClass {
    Material: string;
    MaterialText: string;
    OrderQty: number;
    ReceivedQty: number;
    RejectedPPM: number;
    ReworkQty: number;
}

export class BPCReportFGCPS extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Plant: string;
    Material: string;
    MaterialText: string;
    StickQty: any;
    UOM: string;
    Batch: string;
    Price: any;
    Status: string;
}

export class BPCReportIP extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Material: string;
    MaterialText: string;
    MaterialChar: string;
    Desc: string;
    LowerLimit: number;
    UpperLimit: number;
    UOM: string;
    Method: string;
    ModRule: string;
    Status: string;
}

export class BPCReportGRR extends CommonClass {
    ID: Number;
    Client: String;
    Company: String;
    Type: String;
    PatnerID: String;
    Material: String;
    GRGIDoc: string;
    GRIDate: Date;
    Item: string;
    Description: string;
    MaterialText: String;
    GRGIQty: number;
    OrderQty: Number;
    ReceivedQty: Number;
    RejectedPPM: Number;
    ReworkQty: Number;
    Status: String;
}

export class BPCReportVR extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Material: string;
    MaterialText: string;
    OrderQty: number;
    ReceivedQty: number;
    RejectedPPM: number;
    ReworkQty: number;
    Status: string;

}

export class VendorRatingReportOption extends CommonClass {
    PartnerID: string;
    Material: string;
    PO: string;
    Status: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
}
