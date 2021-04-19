import { CommonClass } from './common';
export class CAPAReqItem extends CommonClass {
    Text: string;
    DueDate: string | null;
    Priority: string;
    Impact: string;
    Department: string;
    CType: string;
    IsDocumentRequired: any;
}
export class CAPAResItemView extends CommonClass {
    ReqID: number;
    ReqItemID: number;
    ResItemID: number;
    PartnerID: string;
    Text: string;
    Date: string;
    Status: string;
    DueDate: string | null;
    AttachmentID: number | null;
    AttachmentName: string;
    ContentType: string;
    AttachmentFile: string;
}
export class CAPAReqItems {
    ReqID: number;
    ReqItemID: number;
    HeaderText: string;
    HeaderStatus:string;
    HeaderDueDate:string | null;
    ItemText: string;
    ItemDueDate: string | null;
    Priority: string;
    Impact: string;
    Patners: string[];
    ItemStatus:string;
}
export class CAPAAcceptItems {
    ReqID: number;
    ReqItemID: number;
    ResItemID: number;
    HeaderText: string;
    ItemText: string;
    ItemDueDate: Date | null;
    ResponseText: string;
    ResponseDueDate: Date | null;
    Patners: string;
    ResponseItemStatus: string;
    AttachmentID: number;   
}
export class CAPAReqHeader extends CommonClass {
    ReqID: number;
    Text: string;
    DueDate: string | null;
    BuyerID: string;
    BuyerMailID:string;
    Date: string;
    Status: string;
    StartDate: string | null;
    Recurring: string;
    Interval: number;
    Ocurrence: number;
}
export class CAPAReqPartner extends CommonClass {
    Client:string;
    Company:string;
    Type:string;
    ReqID: number;
    PatnerID: string;
    Email:string;
    Status:string;
}
export class CAPAReqView extends CAPAReqHeader {
    CAPAReqItems: CAPAReqItem[];
    CAPAReqPartners: CAPAReqPartner[];
}

export class CAPAResHeader extends CommonClass {
    ReqID: number;
    ResID: number;
    PartnerID: string;
    Text: string;
    Date: string | null;
    Status: string;
    DueDate: string | null;
}
export class CAPAResItem extends CommonClass {
    ReqID: number;
    ReqItemID: number;
    ResItemID: number;
    PartnerID: string;
    Text: string;
    Date: string;
    Status: string;
    DueDate: Date | null;
    AttachmentID: number | null;
}
export class CAPAResponseView {
    CAPAResItems: CAPAResItem[];
}
// export class CAPAResponseView extends CAPAResHeader {
//     CAPAResItems: CAPAResItem[];
// }
export class CAPADialogResponse {
    Text: string;
    Status: string;
    DueDate: Date | null;
    IsDocumentRequried:string;
    Files: File | null;
    ActionStatus:string;
}
export class CAPADialogResponseFiles {
    ReqItemID: number;
    Files: File;
    PatnerID:string;
}
export class CAPAAttachment {
    Client: string;
    Company: string;
    Type: string;
    AttachmentID: number;
    ReqID: number;
    ReqItemID: number | null;
    ResItemID: number | null;
    AttachmentName: string;
    ContentType: string;
    ContentLength: number;
    AttachmentFile: string;
}