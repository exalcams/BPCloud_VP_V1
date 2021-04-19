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
    TaxAmount: number | null;
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
    TaxAmount: number | null;
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
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    Item: string;
    SlLine: string;
    Date: Date | string | null;
    OrderedQty: number;
    Batch: string;
    Remarks: string;
    Status: string;
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
export class ActionLog extends CommonClass {
    ID: number;
    UserID: Guid;
    AppName: string;
    Action: string;
    ActionText: string;
    UsedOn: string;
}
export class BPCInvoice extends CommonClass {
    InvoiceNo: string;
    InvoiceDate: Date | string | null;
    InvoiceAmount: number
    Currency: string

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
}
