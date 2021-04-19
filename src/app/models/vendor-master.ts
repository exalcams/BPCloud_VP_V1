import { CommonClass } from './common';

export class CBPType extends CommonClass {
    Type: string;
    Language: string;
    Text: string;
}
export class CBPPostal extends CommonClass {
    PostalCode: string;
    Country: string;
    State: string;
    City: string;
    AddressLine1: string;
    AddressLine2: string;
}
export class CBPBank extends CommonClass {
    BankCode: string;
    BankName: string;
    BankCity: string;
    BankCountry: string;
}
export class CBPTitle extends CommonClass {
    Title: string;
    Language: string;
    TitleText: string;
}
export class CBPDepartment extends CommonClass {
    Department: string;
    Language: string;
    TitleText: string;
}
export class CBPApp extends CommonClass {
    ID: string;
    CCode: string;
    Type: string;
    Level: string;
    User: string;
    StartDate?: Date;
    EndDate?: Date;
}
export class CBPLocation {
    Pincode: string;
    Location: string;
    Taluk: string;
    District: string;
    State: string;
    Country: string;
}
