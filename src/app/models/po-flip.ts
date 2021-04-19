import { CommonClass } from './common';
export class BPCFLIPHeader extends CommonClass {
    ID: number;
    FLIPID: string;
    GSTIN: string;
    InvoiceNumber: number;
    InvoiceDate: Date | string;
    InvoiceCurrency: string;
    InvoiceType: string;
    InvoiceDocID: string;
    InvoiceAmount: number;
    IsInvoiceOrCertified: string;
    IsInvoiceFlag: string;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Plant: string;
    DocNumber: string;
    InvoiceAttachmentName: string;
    BPCAttachment: any;
    bPCFLIPCosts: BPCFLIPCost[];
}
export class BPCFLIPCost extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FLIPID: string;
    Amount: string;
    Remarks: string;
    ExpenceType: string;
}

export class BPCFLIPHeaderView extends CommonClass {
    ID: number;
    FLIPID: string;
    GSTIN: string;
    InvoiceNumber: number;
    InvoiceDate: Date | string;
    InvoiceCurrency: string;
    InvoiceType: string;
    InvoiceDocID: string;
    InvoiceAmount: number;
    IsInvoiceOrCertified: string;
    IsInvoiceFlag: string;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Plant: string;
    DocNumber: string;
    InvoiceAttachmentName: string;
    BPCAttachment: any;
    FLIPCosts: BPCFLIPCost[];
    FLIPItems: BPCFLIPItem[];
    constructor() {
        super();
        this.FLIPItems = [];
    }
}

export class BPCFLIPItem extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FLIPID: string;
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate?: Date;
    // OrderedQty: number;
    UOM: string;
    HSN: string;
    // OpenQty: number;
    InvoiceQty: number; // OpenQty 30 means [20 InvoiceQty(EnterFromHTML)*Price(EnterFromHTML)*Tax(from PO Item)]
    Price: number;
    TaxType: string;
    Tax: number;
    Amount: number;
    // Batch: string;
    // ManufactureDate?: Date;
    // ExpiryDate?: Date;
    // ManfCountry: string;
}
export class BPCExpenseTypeMaster extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ExpenseType: string;
    MaxAmount: string;
}
export class BPCTaxTypeMaster extends CommonClass {
    ID: number;
    // Client: string;
    // Company: string;
    // Type: string;
    // PatnerID: string;
    TaxType: string;
    // MaxAmount: string;
}
export class BPCHSNMaster extends CommonClass {
    ID: number;
    HSNCode: string;
    Description: string;
}
