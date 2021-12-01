import { Guid } from "guid-typescript";

export class UserWithRole {
    UserID: Guid;
    RoleID: Guid;
    UserName: string;
    Plant: string[];
    Email: string;
    Password: string;
    ContactNumber: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
    DisplayName: string;
}
export class UserPreference {
    ID: number;
    UserID: Guid;
    NavbarPrimaryBackground: string;
    NavbarSecondaryBackground: string;
    ToolbarBackground: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class UserView {
    UserID: Guid;
    UserName: string;
    Email: string;
}
export class RoleWithApp {
    RoleID: Guid;
    RoleName: string;
    AppIDList: number[];
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class PO {
    ID: number;
    UserId: Guid;
    POType: string;
    Stage: string[];
    Level: string;
    BeforeEvent: string[];
    AfterEvent: string[];
    AfterDunning1: number;
    AfterDunning2: number;
    AfterDunning3: number;
    Interval: number;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class MenuApp {
    AppID: number;
    AppName: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class AppUsage {
    ID: number;
    UserID: Guid;
    // AppID: number;
    AppName: string;
    UsageCount: number;
    LastUsedOn: Date | string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class AppUsageView {
    ID: number;
    UserID: Guid;
    UserName: string;
    UserRole: string;
    AppName: string;
    UsageCount: number;
    LastUsedOn: Date | string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class Reason {
    ReasonID: number;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class AuthenticationDetails {
    IsAuth: boolean;
    UserID: Guid;
    UserName: string;
    DisplayName: string;
    EmailAddress: string;
    UserRole: string;
    Token: string;
    MenuItemNames: string;
    Profile: string;
    RefreahToken: string;
    Expires: string;
    Issued: string;
    Expiresin: string;
    TourStatus: boolean;
}
export class ChangePassword {
    UserID: Guid;
    UserName: string;
    CurrentPassword: string;
    NewPassword: string;
}
export class LoginModel {
    UserName: string;
    Password: string;
    clientId: string;
}
export class EMailModel {
    EmailAddress: string;
    UserName: string;
    siteURL: string;
}
export class ForgotPassword {
    UserID: Guid;
    EmailAddress: string;
    NewPassword: string;
    Token: string;
}
export class UserNotification {
    ID: number;
    UserID: string;
    Message: string;
    HasSeen: boolean;
    CreatedOn: Date;
    ModifiedOn?: Date;
}
export class VendorUser {
    Email: string;
    Phone: string;
}
export class SessionMaster {
    ID: number;
    ProjectName: string;
    SessionTimeOut: number;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class CreditLimitMaster {
    ID: number;
    UserName: string;
    PlantID: string;
    Email: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class UserLoginHistory {
    ID: number;
    UserID: string;
    UserName: string;
    LoginTime: Date | string;
    LogoutTime: Date | string | null;
    // IP: string;
}
export class LoginHistoryFilter {
    FromDate: string;
    ToDate: string;
    UserName: string;
}
export class ActionLogView {
    ID: number;
    UserID: string;
    AppName: string;
    Action: string;
    ActionText: string;
    UsedOn: string;
    IsActive: boolean;
    CreatedOn: string;
    CreatedBy: string;
    ModifiedOn: string | null;
    ModifiedBy: string;
}
