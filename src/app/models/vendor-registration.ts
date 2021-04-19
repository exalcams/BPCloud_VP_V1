import { CommonClass } from './common';

export class BPVendorOnBoarding extends CommonClass {
    TransID: number;
    Name: string;
    Role: string;
    LegalName: number;
    AddressLine1: string;
    AddressLine2: string;
    City: number;
    State: string;
    Country: string;
    PinCode: number;
    Type: string;
    Phone1: string;
    Phone2: number;
    Email1: string;
    Email2: string;
    VendorCode: number;
    ParentVendor: string;
    Status: string;
}
export class BPIdentity extends CommonClass {
    TransID: number;
    Type: string;
    IDNumber: string;
    ValidUntil?: Date;
    DocID: string;
    AttachmentName: string;
    BPAttachment: any;
    IsValid: boolean;
}
export class BPBank extends CommonClass {
    TransID: number;
    AccountNo: string;
    Name: string;
    IFSC: string;
    BankName: string;
    Branch: string;
    City: string;
    DocID: string;
    AttachmentName: string;
    BPAttachment: any;
    IsValid: boolean;
}
export class BPContact extends CommonClass {
    TransID: number;
    Item: string;
    Name: string;
    Department: string;
    Title: string;
    Mobile: string;
    Email: string;
}
export class BPActivityLog extends CommonClass {
    TransID: number;
    LogID: number;
    Type: string;
    Activity: string;
    Text: string;
    Date?: Date;
    Time: string;
}
export class BPText extends CommonClass {
    TextID: number;
    Text: string;
}


export class BPVendorOnBoardingView extends CommonClass {
    TransID: number;
    Name: string;
    Role: string;
    LegalName: number;
    AddressLine1: string;
    AddressLine2: string;
    City: number;
    State: string;
    Country: string;
    PinCode: number;
    Type: string;
    Phone1: string;
    Phone2: number;
    Email1: string;
    Email2: string;
    VendorCode: number;
    ParentVendor: string;
    Status: string;
    bPIdentities: BPIdentity[];
    bPBanks: BPBank[];
    bPContacts: BPContact[];
    bPActivityLogs: BPActivityLog[];
}
