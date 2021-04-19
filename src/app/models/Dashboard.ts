import { CommonClass } from './common';
import { BPCPIHeader } from './customer';

export class PO {
    PO: number;
    Version: string;
    PODate: Date;
    Currency: string;
    Status: string;
    Document: string;
    NextProcess: string;
}
export class ItemDetails {
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate: Date;
    Proposeddeliverydate: string;
    OrderQty: number;
    GRQty: number;
    PipelineQty: number;
    OpenQty: number;
    UOM: string;
    PlantCode: string;
    UnitPrice: number | null;
    Value: number | null;
    TaxAmount: number | null;
    TaxCode: string;
    MaxAllowedQty: number;
}
export class ASNDetails {
    ASN: string;
    Date: Date;
    Truck: string;
    Status: string;
}
export class GRNDetails {
    GRGIDoc: string;
    Item: string;
    Material: string;
    MaterialText: string;
    GRNDate: Date;
    Qty: number;
    Status: string;
}
export class RETURNDetails {
    Date: Date;
    Type: string;
    Material: string;
    Description: string;
    Qty: number;
    Reason: string;
    DeliveryNote: string;
}

export class QADetails {
    Item: string;
    SerialNumber: number;
    Material: string;
    MaterialText: string;
    Date: Date | string | null;
    LotQty: number | null;
    RejQty: number | null;
    RejReason: string;
}

export class SLDetails {
    Item: string;
    SlLine: string;
    DeliveryDate: Date;
    OrderedQty: number;
    Material: string;
    Description: string;
    Proposeddeliverydate: Date;
    OrderQty: number;
    GRQty: number;
    PipelineQty: number;
    OpenQty: number;
    UOM: string;
}

export class DocumentDetails extends CommonClass {
    AttachmentID: number;
    AttachmentName: string;
    ReferenceNo: string;
    ContentType: string;
    ContentLength: number;
    AttachmentFile: string;
}

export class FlipDetails {
    DocNumber: string;
    FLIPID: string;
    InvoiceDate: Date;
    InvoiceAmount: number;
    InvoiceNumber: string;
    InvoiceType: string;
}

export class OrderFulfilmentDetails {
    PONumber: string;
    PODate: Date;
    Currency: string;
    Version: string;
    Status: string;
    GateStatus: string;
    GRNStatus: string;
    ACKDate: Date;
    ItemCount: number;
    ASNCount: number;
    GRNCount: number;
    QACount: number;
    SLCount: number;
    DocumentCount: number;
    FlipCount: number;
    aSNDetails: ASNDetails[];
    itemDetails: ItemDetails[];
    gRNDetails: GRNDetails[];
    ReturnDetails: GRNDetails[];
    qADetails: QADetails[];
    BPCPIHeader: BPCPIHeader[];
    slDetails: SLDetails[];
    documentDetails: DocumentDetails[];
    flipDetails: FlipDetails[];
    ReturnCount: number;
    constructor() {
        // super();
        this.itemDetails = [];
    }
}
export class Acknowledgement {
    // DalivaryDate: string;
    ItemDetails: ItemDetails[];
    PONumber: string;
    // Status: string;
}
export class OfOption {
    DocNumber: string;
    Status: string;
    FromDate: string;
    ToDate: string;
    PartnerID: string;
    DocType: string;
}

export class POSearch {
    Status: string;
    FromDate: string;
    ToDate: string;
    PartnerID: string;
    DocType: string;
}
export class Status {
    Value: string;
    Name: string;
}
export class OfStatus {
    Value: string;
    Name: string;
}

export class OfType {
    Value: string;
    Name: string;
}

export class DashboardGraphStatus {
    oTIFStatus: OTIFStatus;
    qualityStatus: QualityStatus;
    fulfilmentStatus: FulfilmentStatus;
    deliverystatus: Deliverystatus;
}
export class OTIFStatus {
    OTIF: number;
}
export class QualityStatus {
    Quality: number;
}
export class FulfilmentStatus {
    OpenDetails: FulfilmentDetails;
    ScheduledDetails: FulfilmentDetails;
    InProgressDetails: FulfilmentDetails;
    PendingDetails: FulfilmentDetails;
}
export class FulfilmentDetails {
    Name: string;
    Value: string;
    label: string;
}
export class Deliverystatus {
    Planned1: DeliverystatusDetails;
    Planned2: DeliverystatusDetails;
    Planned3: DeliverystatusDetails;
    Planned4: DeliverystatusDetails;
    Planned5: DeliverystatusDetails;
}
export class DeliverystatusDetails {
    Planned: string;
    Actual: string;
    Date: Date;
}
// export class Deliverystatus {
//     Planned1:DeliverystatusDetails;
//     Planned2:DeliverystatusDetails;
//     Planned3:DeliverystatusDetails;
//     Planned4:DeliverystatusDetails;
//     Planned5:DeliverystatusDetails;
// }
// export class DeliverystatusDetails{
//     Planned:string;
//     Actual:string;
//     Date:Date;
// }

