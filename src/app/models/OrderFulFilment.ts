import { CommonClass } from './common';
import { BPCASNItemSES, BPCInvoiceAttachment } from './ASN';
import { Guid } from 'guid-typescript';
export class BPCOFHeader extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    DocDate: Date | string | null;
    DocVersion: string;
    Currency: string;
    Status: string;
    CrossAmount: number;
    NetAmount: number;
    RefDoc: string;
    AckStatus: string;
    AckRemark: string;
    AckDate: Date | string | null;
    AckUser: string;
    PINNumber: string;
    DocType: string;
    Plant: string;
    PlantName: string;
    DocCount: number;
    ImportVendor: string;
    // ImportVendorEmail: string;
    // ImportVendorContactNumber: string;
}
export class Notification extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    PO: string;
    Status: string;
    POType: string;
    AfterDunning1: boolean;
    AfterDunning2: boolean;
    AfterDunning3: boolean;
    IsAllCompleted: boolean;
}
export class BPCOFItem extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number;
    CompletedQty: number;
    TransitQty: number;
    OpenQty: number;
    UOM: string;
    HSN: string;
    IsClosed: boolean;
    AckStatus: string;
    AckDeliveryDate: Date | string | null;
    PlantCode: string;
    UnitPrice: number | null;
    Value: number | null;
    NetAmount: number | null;
    TaxAmount: number | null;
    FreightAmount: number | null;
    OtherAmount: number | null;
    TaxCode: string;
    MaxAllowedQty: number;
}

export class BPCOFItemView extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number;
    CompletedQty: number;
    TransitQty: number;
    OpenQty: number;
    UOM: string;
    HSN: string;
    IsClosed: boolean;
    AckStatus: string;
    AckDeliveryDate: Date | string | null;
    PlantCode: string;
    UnitPrice: number | null;
    Value: number | null;
    NetAmount: number | null;
    TaxAmount: number | null;
    FreightAmount: number | null;
    OtherAmount: number | null;
    TaxCode: string;
    MaxAllowedQty: number;
    BPCOFItemSESes: BPCASNItemSES[];
    constructor() {
        super();
        this.BPCOFItemSESes = [];
    }
}
export class BPCOFScheduleLine extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    SlLine: string;
    DelDate?: Date;
    OrderedQty: number;
    AckStatus: string;
    AckDelDate?: Date;
}
export class BPCOFGRGI extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Plant: string;
    DocNumber: string;
    GRGIDoc: string;
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate?: Date;
    GRGIQty: number;
    ShippingPartner: string;
    ShippingDoc: string;
}
export class BPCOFQM extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    SerialNumber: number;
    Material: string;
    MaterialText: string;
    GRGIQty: number;
    LotQty: number;
    RejQty: number;
    RejReason: string;
}
export class BPCOFAIACT extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    SeqNo: string;
    AppID: string;
    DocNumber: string;
    ActionText: string;
    Status: string;
    Date: Date | string | null;
    Time: string;
    HasSeen: boolean;
}
export class PODetails {
    PO: string;
    Version: string;
    Currency: string;
    PODate?: Date;
    Status: string;
    Document: string;

}

export class ASNDetails {
    ASN: string;
    Date?: Date;
    Truck: string;
    Status: string;
}

export class ItemDetails {
    Item: string;
    MaterialText: string;
    DalivaryDate?: Date;
    OrderQty: number;
    GRQty: number;
    PipelineQty: number;
    OpenQty: number;
    UOM: string;
}

export class GRNDetails {
    Item: string;
    MaterialText: string;
    GRNDate?: Date;
    Qty: number;
    Status: string;
}

export class QADetails {
    Item: string;
    MaterialText: string;
    Date?: Date;
    LotQty: number;
    RejQty: number;
    RejReason: string;
}

export class OrderFulfilmentDetails {
    PONumber: string;
    PODate?: Date;
    Currency: string;
    Version: string;
    Status: string;
    aSNDetails: ASNDetails[];
    itemDetails: ItemDetails[];
    gRNDetails: GRNDetails[];
    qADetails: QADetails[];
}
export class POScheduleLineView {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    Material: string;
    MaterialText: string;
    SlLine: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number;
}

export class BPCOFSubcon extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    SlLine: string;
    SubconID: number;
    Date: Date | string;
    OrderedQty: number;
    Batch: string;
    Remarks: string;
    Status: string;
    ShippedQty: number;
    ReadyToBeShippedQty: number;
}

export interface BPCOFSubconView {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    SlLine: string;
    OrderedQty: number;
    ShippedQty: number;
    ReadyToBeShippedQty: number;
}
export class SubconItems {
    items: BPCOFSubcon[];
    constructor() {
        this.items = [];
    }
}
export class BPCOFHeaderXLSX {
    Type: string;
    Patnerid: string;
    Docnumber: string;
    Docdate: string;
    Currency: string;
    Status: string;
    Refdocument: string;
}

export class BPCOFItemXLSX {
    Partnerid: string;
    Docnumber: string;
    Itemnumber: string;
    Materialnumber: string;
    Materialtext: string;
    UOM: string;
    Orderqty: number;
}

export class BPCOFScheduleLineXLSX {
    Partnerid: string;
    Docnumber: string;
    Itemnumber: string;
    Sline: string;
    Type: string;
    Deldate: string;
    Orderquantity: number;
}

export class BPCOFGRGIXLSX {
    Partnerid: string;
    Docnumber: string;
    Type: string;
    Item: string;
    Material: string;
    Materialtext: string;
    Grgidoc: string;
    Unit: string;
    Grgiqty: number;
}

export class BPCOFQMXLSX {
    Patnerid: string;
    Type: string;
    Material: string;
    MaterialText: string;
    Item: string;
    Insplotno: string;
    Unit: string;
    Lotqty: number;
    Rejqty: number;
}

export class OfAttachmentData {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    OfAttachments: BPCInvoiceAttachment[];
}
export class SOItemCount {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumberCount: string;
    ItemCount: number;
    GRGICount: number;
    PODCount: number;
    InvCount: number;
    ReturnCount: number;
}
export class BPCPlantMaster extends CommonClass {
    PlantCode: string;
    PlantText: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    Country: string;
    PinCode: string;
}
export class CBPLocation extends CommonClass {
    Pincode: string;
    Location: string;
    Taluk: string;
    District: string;
    State: string;
    StateCode: string;
    Country: string;
    CountryCode: string;
}
export class ActionLog extends CommonClass {
    ID: number;
    UserID: Guid;
    AppName: string;
    Action: string;
    ActionText: string;
    UsedOn: string;
}
export class BPCInvoice extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    InvoiceNo: string;
    InvoiceDate: Date | string | null;
    InvoiceAmount: number;
    AWBNumber: string;
    PoReference: string;
    PaidAmount: number;
    BalanceAmount: number | null;
    Currency: string;
    DateofPayment: Date | string | null;
    Plant: string;
    Status: string;
    AttID: string;
    PODDate: Date | string | null;
    PODConfirmedBy: string;

}

export class InvoiceVendor {
    // name:string;
    InvoiceNo: string;
    InvoiceDate: Date | null;
    InvoiceAmount: number;
    BalanceAmount: number;
    ReasonCode: string;
}


export class BPCRetNew extends CommonClass {
    ReturnOrder: string;
    Date: Date | string | null;
    Material: string;
    Text: string;
    Qty: number;
    Status: string;
    Document: string;
}
export class BPCOFHeaderView extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    DocDate: Date | string | null;
    DocVersion: string;
    Currency: string;
    Status: string;
    GateStatus: string;
    GRNStatus: string;
    CrossAmount: number;
    NetAmount: number;
    RefDoc: string;
    AckStatus: string;
    AckRemark: string;
    AckDate: Date | string | null;
    AckUser: string;
    PINNumber: string;
    DocType: string;
    PlantName: string;
    DocCount: number;
    ImportVendor: string;
    // ImportVendorEmail: string;
    // ImportVendorContactNumber: string;
}

export class BPCOFHeaderView1 extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    DocDate: Date | string | null;
    DocVersion: string;
    Status: string;
    GateStatus: string;
    GRNStatus: string;
    RefDoc: string;
    DocType: string;
    PlantName: string;
    DocCount: number;
    Item: string;
    Material: string;
    MaterialText: string;
    PlantCode: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number | null;
    CompletedQty: number | null;
    TransitQty: number | null;
    OpenQty: number | null;
}

export class BPCOffer extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ConditionType: string;
    Material: string;
    Currency: string;
    Amount: number | null;
    ConditionValue: number | null;
    Name: string;
    RateUnit: string;
    PricingUnit: string;
    UOM: string;
}
