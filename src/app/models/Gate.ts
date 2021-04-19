import { CommonClass } from './common';

export class BPCGateHoveringVechicles extends CommonClass {
    client: string;
    company: string;
    type: string;
    patnerID: string;
    date?: Date;
    time?: Date;
    // CancelDuration?:Date;
    truck: string;
    partner: string;
    docNo: string;
    transporter: string;
    gate: string;
    plant: string;
}
