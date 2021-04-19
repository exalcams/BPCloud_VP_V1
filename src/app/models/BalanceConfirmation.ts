import { CommonClass } from './common';

export class BalanceConfirmationHeader extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    BillAmount: number | null;
    PaidAmont: number | null;
    TDSAmount: number | null;
    TotalPaidAmount: number | null;
    DownPayment: number | null;
    NetDueAmount: number | null;
    Currency: string;
    BalDate: Date | string | null;
    Plant: string;
    Status: string;
    AcceptedOn: Date | string | null;
    AcceptedBy: string;
}

export class BalanceConfirmationItem extends CommonClass {
    Client: string;
    Company: string;
    Type: string;
    PatnerID: string;
    FiscalYear: string;
    DocNumber: string;
    DocDate: Date | string | null;
    InvoiceNumber: string;
    InvoiceAmount: number | null;
    BillAmount: number | null;
    PaidAmont: number | null;
    TDSAmount: number | null;
    TotalPaidAmount: number | null;
    DownPayment: number | null;
    NetDueAmount: number | null;
    Currency: string;
    BalDate: Date | string | null;
}
export class ConfirmationDetails {
    ConfirmedBy: string;
}
// export class BPCPayAccountStatement extends CommonClass {
//     Client: string;
//     Company: string;
//     Type: string;
//     PartnerID: string;
//     FiscalYear: string;
//     DocumentNumber: string;
//     DocumentDate: string | null;
//     InvoiceNumber: string;
//     InvoiceDate: string | null;
//     InvoiceAmount: number;
//     BalanceAmount: number;
//     PaidAmount: number;
//     Reference: string;
//     Status: string;
//     AcceptedOn: string | null;
//     AcceptedBy: string;
// }
