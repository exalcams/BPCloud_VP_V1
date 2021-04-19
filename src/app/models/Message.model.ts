import { CommonClass } from './common';

export class BPCCEOMessage extends CommonClass {
    MessageID: number;
    CEOMessage: string;
    IsReleased: boolean;
}
export class BPCSCOCMessage extends CommonClass {
    MessageID: number;
    SCOCMessage: string;
    IsReleased: boolean;
}
export class BPCWelcomeMessage extends CommonClass {
    MessageID: number;
    WelcomeMessage: string;
    IsReleased: boolean;
}
