import { CommonClass } from './common';

export class BPCPODHeader extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    InvoiceNumber: string;
    InvoiceDate: Date | string | null;
    TruckNumber: string;
    VessleNumber: string;
    Amount: number | null;
    Currency: string;
    Transporter: string;
    Plant: string;
    Status: string;
    Doc: string;
}

export class BPCPODItem extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    InvoiceNumber: string;
    Item: string;
    Material: string;
    MaterialText: string;
    Qty: number;
    ReceivedQty: number | null;
    BreakageQty: number | null;
    MissingQty: number | null;
    AcceptedQty: number | null;
    Reason: string;
    Remarks: string;
    AttachmentName: string;
    AttachmentReferenceNo: string;
}
export class BPCPODView extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    DocNumber: string;
    InvoiceNumber: string;
    InvoiceDate: Date | string | null;
    TruckNumber: string;
    VessleNumber: string;
    Amount: number | null;
    Currency: string;
    Transporter: string;
    Plant: string;
    Status: string;
    PODItems: BPCPODItem[];
    Recived_status: string
    Doc: string;
}
export class BPCReasonMaster extends CommonClass {
    ID: number;
    ReasonCode: string;
    ReasonText: string;
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
export class ChartDetails {
    Name: string;
    Value: number;
    label: string;
}
