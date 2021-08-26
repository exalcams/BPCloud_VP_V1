import { CommonClass } from './common';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
export class BPCASNHeader extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    ASNDate: Date | string | null;
    DocNumber: string;
    TransportMode: string;
    VessleNumber: string;
    CountryOfOrigin: string;
    AWBNumber: string;
    AWBDate: Date | string | null;
    DepartureDate: Date | string | null;
    ArrivalDate: Date | string | null;
    ShippingAgency: string;
    GrossWeight: number | null;
    GrossWeightUOM: string;
    NetWeight: number | null;
    NetWeightUOM: string;
    VolumetricWeight: number | null;
    VolumetricWeightUOM: string;
    NumberOfPacks: number | null;
    InvoiceNumber: string;
    InvoiceDate: Date | string | null;
    POBasicPrice: number | null;
    TaxAmount: number | null;
    InvoiceAmount: number | null;
    InvoiceAmountUOM: string;
    InvDocReferenceNo: string;
    Status: string;
    IsSubmitted: boolean;
    ArrivalDateInterval: number;
    BillOfLading: string;
    TransporterName: string;
    AccessibleValue: number | null;
    ContactPerson: string;
    ContactPersonNo: string;
    Plant: string;
    Field1: string;
    Field2: string;
    Field3: string;
    Field4: string;
    Field5: string;
    Field6: string;
    Field7: string;
    Field8: string;
    Field9: string;
    Field10: string;
}
export class BPCASNItem extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number;
    CompletedQty: number;
    TransitQty: number;
    OpenQty: number;
    ASNQty: number;
    UOM: string;
    HSN: string;
    PlantCode: string;
    UnitPrice: number | null;
    Value: number | null;
    TaxAmount: number | null;
    TaxCode: string;
}

export class BPCASNItemView extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    Item: string;
    Material: string;
    MaterialText: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number;
    CompletedQty: number;
    TransitQty: number;
    OpenQty: number;
    ASNQty: number;
    UOM: string;
    HSN: string;
    PlantCode: string;
    UnitPrice: number | null;
    Value: number | null;
    TaxAmount: number | null;
    TaxCode: string;
    ASNItemBatches: BPCASNItemBatch[];
    ASNItemSESes: BPCASNItemSES[];
    constructor() {
        super();
        this.ASNItemBatches = [];
        this.ASNItemSESes = [];
    }
}

export class BPCASNItemBatch extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    Item: string;
    Batch: string;
    Qty: number;
    ManufactureDate: Date | string | null;
    ExpiryDate: Date | string | null;
    ManufactureCountry: string;
}

export class BPCASNItemBatchQty extends CommonClass {
    ASNQty: number;
    ASNItemBatchs: BPCASNItemBatch[];
    IsEnabled: boolean;
}

export class BPCASNItemSESQty extends CommonClass {
    ASNQty: number;
    ASNItemSESes: BPCASNItemSES[];
    IsEnabled: boolean;
}

export class BPCASNItemSES extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    Item: string;
    ServiceNo: string;
    ServiceItem: string;
    OrderedQty: number;
    OpenQty: number;
    ServiceQty: number;
}
export class BPCASNPack extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    // Item: string;
    PackageID: string;
    ReferenceNumber: string;
    Dimension: string;
    GrossWeight: number | null;
    GrossWeightUOM: string;
    NetWeight: number | null;
    NetWeightUOM: string;
    VolumetricWeight: number | null;
    VolumetricWeightUOM: string;
}

export class BPCASNFieldMaster extends CommonClass {
    ID: number;
    Field: string;
    FieldName: string;
    Text: string;
    DefaultValue: string;
    Mandatory: boolean;
    Invisible: boolean;
    DocType: string;
}
export class BPCFLIPHeader extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FLIPID: string;
    InvoiceNumber: string;
    InvoiceDate: Date | string | null;
    POBasicPrice: number | null;
    TaxAmount: number | null;
    InvoiceAmount: number;
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
    DeliveryDate: Date | string | null;
    OrderedQty: number;
    OpenQty: number;
    InvoiceQty: number;
    UOM: string;
    HSN: string;
}

export class BPCFLIPCost extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FLIPID: string;
    ExpenceType: string;
    Amount: number;
    Remarks: string;
}

export class BPCASNView extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    ASNDate: Date | string | null;
    DocNumber: string;
    TransportMode: string;
    VessleNumber: string;
    CountryOfOrigin: string;
    AWBNumber: string;
    AWBDate: Date | string | null;
    DepartureDate: Date | string | null;
    ArrivalDate: Date | string | null;
    ShippingAgency: string;
    GrossWeight: number | null;
    GrossWeightUOM: string;
    NetWeight: number | null;
    NetWeightUOM: string;
    VolumetricWeight: number | null;
    VolumetricWeightUOM: string;
    NumberOfPacks: number | null;
    InvoiceNumber: string;
    InvoiceDate: Date | string | null;
    POBasicPrice: number | null;
    TaxAmount: number | null;
    InvoiceAmount: number | null;
    InvoiceAmountUOM: string;
    InvAttachmentName: string;
    InvDocReferenceNo: string;
    IsSubmitted: boolean;
    Status: string;
    ArrivalDateInterval: number;
    BillOfLading: string;
    TransporterName: string;
    AccessibleValue: number | null;
    ContactPerson: string;
    ContactPersonNo: string;
    Plant: string;
    Field1: string;
    Field2: string;
    Field3: string;
    Field4: string;
    Field5: string;
    Field6: string;
    Field7: string;
    Field8: string;
    Field9: string;
    Field10: string;
    ASNItems: BPCASNItemView[];
    ASNPacks: BPCASNPack[];
    DocumentCenters: DocumentCenter[];
    constructor() {
        super();
        this.ASNItems = [];
        this.ASNPacks = [];
        this.DocumentCenters = [];
    }
}
export class DocumentCenter extends CommonClass {
    ASNNumber: string;
    DocumentType: string;
    DocumentTitle: string;
    Filename: string;
    AttachmentReferenceNo: string;
}

export class BPCInvoiceAttachment {
    AttachmentID: number;
    AttachmentName: string;
    ReferenceNo: string;
    ContentType: string;
    ContentLength: number;
}

export class BPCCountryMaster extends CommonClass {
    ID: number;
    CountryCode: string;
    CountryName: string;
}
export class BPCCurrencyMaster extends CommonClass {
    ID: number;
    CurrencyCode: string;
    CurrencyName: string;
}
export class BPCDocumentCenterMaster extends CommonClass {
    AppID: number;
    DocumentType: string;
    Text: string;
    Mandatory: boolean;
    Extension: string;
    SizeInKB: number;
    ForwardMail: string;
}

export class ASNItemXLSX {
    Item: string;
    Material: string;
    MaterialText: string;
    UnitPrice: number;
    HSN: string;
    DeliveryDate: Date | string | null;
    OrderedQty: number;
    GRQty: number;
    PipelineQty: number;
    OpenQty: number;
    ASNQty: number;
    // Batch: string;
    // ManufactureDate: Date | string | null;
    // ExpiryDate: Date | string | null;
}

export class ASNItemXLSXdup {
    Item: string;
    Material: string;
    MaterialText: string;
    UnitPrice: number;
   
    // Batch: string;
    // ManufactureDate: Date | string | null;
    // ExpiryDate: Date | string | null;
}
export class ASNListView {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    ASNDate: Date | string | null;
    ArrivalDate: Date | string | null;
    DepartureDate: Date | string | null;
    CancelDuration: Date;
    Time: any;
    TurnaroundTime: string;
    TransportMode: string;
    DocNumber: string;
    VessleNumber: string;
    AWBNumber: string;
    Plant: string;
    // Material: string;
    // MaterialText: string;
    // ASNQty: number;
    InvoiceNumber: string;
    InvoiceAttachmentName: string;
    Status: string;
    DocCount: number;
}
export class BPCASNAttachment {
    ASNNumber: string;
    AttachmentID: number;
    AttachmentName: string;
    Type: string;
    DocumentType: string;
    Title: string;
}
export class ASNListViewNewDoc {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ASNNumber: string;
    ASNDate: Date | string | null;
    ArrivalDate: Date | string | null;
    DepartureDate: Date | string | null;
    CancelDuration: Date;
    Time: any;
    TurnaroundTime: string;
    TransportMode: string;
    DocNumber: string;
    VessleNumber: string;
    AWBNumber: string;
    Plant: string;
    // Material: string;
    // MaterialText: string;
    // ASNQty: number;
    Status: string;
    AttachmentName: string;
    ContentType: string;
    ContentLength: string;
    AttachmentFile: any;

}
export class ASNListFilter {
    Plants: string[];
    ASNNumber: string;
    DocNumber: string;
    Material: string;
    Status: string;
    ASNFromDate: Date | string | null;
    ASNToDate: Date | string | null;
    constructor() {
        this.Plants = [];
    }
}

export class GRNListFilter {
    Plants: string[];
    GRN: string;
    Material: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    constructor() {
        this.Plants = [];
    }
}

