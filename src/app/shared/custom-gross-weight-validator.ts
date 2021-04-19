import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomGrossWeightValidator {
    static confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

        if (!control.parent || !control) {
            return null;
        }

        const grossWeight = control.parent.get('GrossWeight');
        const netWeight = control.parent.get('NetWeight');

        if (!grossWeight || !netWeight) {
            return null;
        }

        // if (!grossWeight.value || !netWeight.value) {
        //     return null;
        // }

        // if (+(grossWeight.value) < +(netWeight.value)) {
        //     return null;
        // }

        const GrossWeightVAL = +grossWeight.value;
        const NetWeightVAL = + netWeight.value;
        if (GrossWeightVAL < NetWeightVAL) {
            return { 'grossWeightError': true };
        } else {
            return null;
        }
    }
}
