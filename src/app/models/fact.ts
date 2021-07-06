import { CommonClass } from './common';
export class BPCFact extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    GSTNumber: string;
    PANNumber: string;
    LegalName: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    Country: string;
    PinCode: string;
    Phone1: string;
    Phone2: string;
    Email1: string;
    Email2: string;
    TaxID1: string;
    TaxID2: string;
    OutstandingAmount: number;
    CreditAmount: number;
    LastPayment: number;
    Currency: string;
    CreditLimit: number;
    CreditBalance: number;
    Name: string;
    Role: string;
    Plant: string;
    GSTStatus: string;
    LastPaymentDate: Date | string | null;
    CreditEvalDate: Date | string | null;
    MSME: boolean;
    MSME_TYPE: string;
    MSME_Att_ID: string;
    RP_Att_ID: string;
    TDS_Att_ID: string;
    Reduced_TDS: boolean;
    TDS_RATE: string;
    TDS_Cert_No: string
    RP: boolean;
    RP_Name: string;
    RP_Type: string;
    IsBlocked: boolean;
    PurchaseOrg: string;
    AccountGroup: string;
    CompanyCode: string;
    TypeofIndustry: string;
    VendorCode: string;
}
export class BPCFactContactPerson extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ContactPersonID: string;
    Name: string;
    ContactNumber: string;
    Email: string;
    Item: string;
    Department: string;
    Title: string;
    Mobile: string;
}
export class BPCFactBank extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    AccountNo: string;
    Name: string;
    BankID: string;
    BankName: string;

    IFSC: string;
    Branch: string;
    City: string;
    Country: string;
}
export class BPCKRA extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    KRA: string;
    EvalDate?: Date;
    KRAText: string;
    KRAValue: string;
}
export class BPCAIACT extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    SeqNo: number;
    ActType: string;
    AppID: string;
    DocNumber: string;
    Action: string;
    ActionText: string;
    Status: string;
    Date: Date | string | null;
    Time: string;
    IsSeen: boolean;
}
export class BPCCertificate extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    CertificateType: string;
    CertificateName: string;
    Validity: Date | string | null;
    Mandatory: string;
    Attachment: string;
    AttachmentFile: File;
    AttachmentID: number;
}

export class BPCCertificateAttachment extends CommonClass {

    client: string;
    company: string;
    type: string;
    patnerID: string;
    CertificateType: string;
    CertificateName: string;
    // filename:string;
    file: File;
}
export class BPCFactView extends CommonClass {
    ID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    GSTNumber: string;
    PANNumber: string;
    LegalName: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    Country: string;
    PinCode: string;
    Phone1: string;
    Phone2: string;
    Email1: string;
    Email2: string;
    TaxID1: string;
    TaxID2: string;
    OutstandingAmount: number;
    CreditAmount: number;
    LastPayment: number;
    LastPaymentDate?: Date;
    Currency: string;
    CreditLimit: number;
    CreditBalance: number;
    CreditEvalDate?: Date;
    BPCFactContactPersons: BPCFactContactPerson[];
    BPCFactBanks: BPCFactBank[];
    BPCKRAs: BPCKRA[];
    BPCAIACTs: BPCAIACT[];
    BPCFactCerificate: BPCCertificate[];
}
export class FactViewSupport {
    BPCFact: BPCFact;
    BPCFactBanks: BPCFactBank[];
    BPCFactCerificate: BPCCertificate[];
}
export class CustomerBarChartData {
    BarChartLabels: string[];
    PlannedData: string[];
    ActualData: string[];
}
export class BPCFactXLSX {
    ID: number;
    Client: string;
    Company: string;
    Patnerid: string;
    Legalname: string;
    Type: string;
    Postal: string;
    Currency: string;
    City: string;
    District: string;
    Accountgroup: string;
    Phone1: string;
    Phone2: string;
    Tax1: string;
    Tax2: string;
    Outstandingamount: number;
    Lastpayment: number;
    Lastpaymentdate: string;
}
export class BPCFactBankXLSX {
    Partnerid: string;
    Accountnumber: string;
    Accountname: string;
    Bankid: string;
    Bankname: string;
}
export class CAPAvendor {
    Vendors: BPCFact[];
    SelectedVendors: BPCFact[];
    Action: boolean;
}
export class BPCAttachments extends CommonClass {
    AttachmentID: number;
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    ReferenceNo: string;
    AttachmentName: string;
    ContentType: string;
    ContentLength: string;
    AttachmentFile: any;
    Category: string;
    // AttachmentFile:Uint8Array;
    // 

}
export class BPCAttach {

    AttachmentID: number;
    AttachmentName: string;
    Catogery: string;
}
// export class BPCOTIF extends CommonClass {
//     Client: string;
//     Company: string;
//     Type: string;
//     PatnerID: string;
//     KRA: string;
//     Material: string;
//     Date: Date | string;
//     Text: string;
//     Value: number;
// }
export class BPCOTIFView extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Date: Date | string;
    TurnOver: number;
    OTIF: number;
    OutOfStock: number;
    TotalStock: number;
    TurnOverPercentage: number;
    OTIFPercentage: number;
    OutOfStockPercentage: number;
    TotalStockPercentage: number;
    AverageTimeToSell: number;
    AverageNoOfSubcon: number;
    KRAText: string;
    KRAValue: number;
    Plant: string;
    Material: string;
    Month: string;
    Day: string;
}
export class OTIFChartDetails {
    Name: string;
    Value: number;
    label: string;
}
export class BPCSE extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    Period: Date | string;
    ECriteria: string;
    ECriteriaText: string;
    ParentECriteria: string;
    ParentECriteriaText: string;
    Percentage: number;
}
