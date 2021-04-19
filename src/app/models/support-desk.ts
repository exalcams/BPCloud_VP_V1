
import { CommonClass } from './common';
export class SupportMaster extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    ReasonCode: string;
    ReasonText: string;
}
export class SupportHeader extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    SupportID: string;
    ReasonCode: string;
    Reason: string;
    Plant: string;
    Date: Date | string | null;
    DocumentRefNo: string;
    AppID: string;
    AttachmentID: string;
    Remarks: string;
    Status: string;
    IsResolved: boolean;

}
export class SupportLog extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    SupportID: string;
    SupportLogID: string;
    Remarks: string;
    AttachmentID: string;
    IsResolved: boolean;
}

// export class SupportLogView extends CommonClass {
//     Client: string;
//     Company: string;
//     Type: string;
//     PatnerID: string;
//     SupportID: string;
//     SupportLogID: string;
//     Remarks: string;
//     AttachmentID: string;
//     IsResolved: boolean;
// }

export class SupportDetails extends CommonClass {
    supportHeader: SupportHeader;
    supportLogs: SupportLog[];
    supportAttachments: BPCSupportAttachment[];
    supportLogAttachments: BPCSupportAttachment[];
}
export class BPCSupportAttachment {
    AttachmentID: number;
    AttachmentName: string;
    ContentType: string;
    ContentLength: number;
    SupportID: string;
    SupportLogID: string;
    AttachmentFile: any;
}
export class SupportHeaderView extends CommonClass {
    SupportID: string;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Plant: string;
    AppID: string;
    ReasonCode: string;
    Date: Date | string | null;
    AssignTo: string;
    Status: string;
    Remarks: string;
    DocumentRefNo: string;
    IsResolved: boolean;
    Reason: string;
}
export class SupportLogView extends CommonClass {
    ID: number;
    SupportID: string;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Status: string;
    Remarks: string;
    IsResolved: boolean;
    PatnerEmail: string;
}
export class SupportMasterView extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Plant: string;
    App: string;
    ReasonCode: string;
    ReasonText: string;
    Person1: string;
    Person2: string;
    Person3: string;
}

export class SupportAppMaster extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    AppID: string;
    AppName: string;
}
