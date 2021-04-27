import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BPCFactContactPerson, BPCFactBank, BPCKRA, BPCAIACT, BPCFactView, BPCFact, BPCCertificate, BPCFactXLSX, BPCFactBankXLSX, FactViewSupport, BPCCertificateAttachment, BPCAttachments, BPCAttach, BPCSE } from 'app/models/fact';
import { AnimationKeyframesSequenceMetadata } from '@angular/animations';
// import { BPCFactContactPerson, BPCFactBank, BPCKRA, BPCAIACT, BPCFactView, BPCFact, BPCFactBankXLSX, BPCFactXLSX } from 'app/models/fact';

@Injectable({
  providedIn: 'root'
})
export class FactService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
  }

  // Facts
  GetAllFacts(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}factapi/Fact/GetAllFacts`)
      .pipe(catchError(this.errorHandler));
  }
  GetAllVendors(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}factapi/Fact/GetAllVendors`)
      .pipe(catchError(this.errorHandler));
  }
  GetFactByPartnerID(PartnerID: string): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}factapi/Fact/GetFactByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetFactByPartnerIDAndType(PartnerID: string, Type: string): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}factapi/Fact/GetFactByPartnerIDAndType?PartnerID=${PartnerID}&Type=${Type}`)
      .pipe(catchError(this.errorHandler));
  }

  GetFactByEmailID(EmailID: string): Observable<BPCFact | string> {
    return this._httpClient.get<BPCFact>(`${this.baseAddress}factapi/Fact/GetFactByEmailID?EmailID=${EmailID}`)
      .pipe(catchError(this.errorHandler));
  }

  FindFactByTaxNumber(TaxNumber: string): Observable<BPCFact | string> {
    return this._httpClient.get<BPCFact>(`${this.baseAddress}factapi/Fact/FindFactByTaxNumber?TaxNumber=${TaxNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  UpdateAttachment(Attachment: BPCAttachments[]): Observable<any> {
    const formData: FormData = new FormData();
    Attachment.forEach(x => {
      if (x.AttachmentFile) {
        var name = x.AttachmentID.toString() + "_" + x.Category;
        formData.append(name, x.AttachmentFile, x.AttachmentFile.name);
      }
    });
    formData.append('Client', Attachment[0].Client);
    formData.append('Company', Attachment[0].Company)
    formData.append('PatnerID', Attachment[0].PatnerID);
    formData.append('ReferenceNo', Attachment[0].ReferenceNo);
    formData.append('Type', Attachment[0].Type);
    console.log('UpdateAttachment FormData',formData);
    return this._httpClient.post<any[]>(`${this.baseAddress}factapi/Fact/UpdateAttachment`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  //#region  GettAttchmentByAttId

  GettAttchmentByAttId(AttachmentID: number): Observable<BPCAttachments | any> {
    return this._httpClient.get<BPCAttachments>(`${this.baseAddress}factapi/Fact/GettAttchmentByAttId?AttachmentID=${AttachmentID}`)
      .pipe(catchError(this.errorHandler));
  }
  //#endregion
  CreateFact(Fact: BPCFactView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/CreateFact`,
      Fact,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateFact(Fact: BPCFactView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UpdateFact`,
      Fact,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  UpdateFact_BPCFact(Fact: BPCFact): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UpdateFact_BPCFact`,
      Fact,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  UpdateFactSupport(Fact: FactViewSupport): Observable<any> {
    console.log("DATA SERVICE", Fact);
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UpdateFactSupport`,
      Fact,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  UpdateFactSupportDataToMasterData(partnerId: string): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UpdateFactSupportDataToMasterData?partnerId=${partnerId}`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  DeleteFact(Fact: BPCFact): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/DeleteFact`,
      Fact,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetContactPersonsByPartnerID(PartnerID: string): Observable<BPCFactContactPerson[] | string> {
    return this._httpClient.get<BPCFactContactPerson[]>(`${this.baseAddress}factapi/Fact/GetContactPersonsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetBanksByPartnerID(PartnerID: string): Observable<BPCFactBank[] | string> {
    return this._httpClient.get<BPCFactBank[]>(`${this.baseAddress}factapi/Fact/GetBanksByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetKRAsByPartnerID(PartnerID: string): Observable<BPCKRA[] | string> {
    return this._httpClient.get<BPCKRA[]>(`${this.baseAddress}factapi/Fact/GetKRAsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  CreateKRAs(KRAs: BPCKRA[], PartnerID: string): Observable<BPCKRA[] | string> {
    console.log("KRA Data sent to api:", KRAs);
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/CreateKRAs?PartnerId=${PartnerID}`,
      KRAs,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetAIACTsByPartnerID(PartnerID: string): Observable<BPCAIACT[] | string> {
    return this._httpClient.get<BPCAIACT[]>(`${this.baseAddress}factapi/Fact/GetAIACTsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetActionsByPartnerID(PartnerID: string): Observable<BPCAIACT[] | string> {
    return this._httpClient.get<BPCAIACT[]>(`${this.baseAddress}factapi/Fact/GetActionsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetNotificationsByPartnerID(PartnerID: string): Observable<BPCAIACT[] | string> {
    return this._httpClient.get<BPCAIACT[]>(`${this.baseAddress}factapi/Fact/GetNotificationsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateAIACT(notification: BPCAIACT): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UpdateAIACT`,
      notification,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateAIACTs(SeqNos: number[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UpdateAIACTs`,
      SeqNos,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetCertificatesByPartnerID(PartnerID: string): Observable<BPCCertificate[] | string> {
    return this._httpClient.get<BPCCertificate[]>(`${this.baseAddress}factapi/Fact/GetCertificatesByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  AcceptAIACT(AIACT: BPCAIACT): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/AcceptAIACT`,
      AIACT,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  AcceptAIACTs(AIACT: any): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/AcceptAIACTs`,
      AIACT,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  RejectAIACT(AIACT: BPCAIACT): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/RejectAIACT`,
      AIACT,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  CreateFacts(Facts: BPCFactXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/CreateFacts`,
      Facts,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  CreateFactBanks(Banks: BPCFactBankXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/CreateBanks`,
      Banks,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  CreateFactBanksSupport(Banks: BPCFactBank): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/CreateSupportBank`,
      Banks,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  CreateFactCertificateSupport(Cer: BPCCertificate): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/CreateCertificateSupport`,
      Cer,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  DeleteFactBank(Banks: BPCFactBank): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/DeleteBank`,
      Banks,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  UploadOfAttachment(selectedFile: BPCCertificateAttachment): Observable<any> {
    let formData = new FormData();
    if (selectedFile) {
      formData.append(selectedFile.file.name, selectedFile.file, selectedFile.file.name);
    }
    formData.append('PartnerID', selectedFile.patnerID);
    formData.append('CertificateName', selectedFile.CertificateName);
    formData.append('CertificateType', selectedFile.CertificateType);
    formData.append('Client', selectedFile.client);
    formData.append('Company', selectedFile.company);
    formData.append('Type', selectedFile.type);
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/UploadOfCertificateAttachment`,
      formData,
    ).pipe(catchError(this.errorHandler));

  }
  DownloadOfAttachment(PartnerID: string, certificateName: string, certificateType: string,AttachmentID:number): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}factapi/Fact/DownloadOfAttachment?PartnerID=${PartnerID}&certificateName=${certificateName}
    &certificateType=${certificateType}&AttachmentID=${AttachmentID}`,
      {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      })
      .pipe(catchError(this.errorHandler));
  }
  DeleteFactCertificate(cer: BPCCertificate): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/DeleteCertificate`,
      cer,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  CreateFactSupportXML(PatnerID: any): Observable<any> {
    return this._httpClient.get<any>(`${this.baseAddress}factapi/Fact/CreateFactSupportXML?PatnerID=${PatnerID}`,
    ).pipe(catchError(this.errorHandler));
  }
  SaveDashboardCards(CreatedBy: string, selectedFiles: File[]): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFiles && selectedFiles.length) {
      selectedFiles.forEach(x => {
        formData.append(x.name, x, x.name);
      });
    }
    formData.append('CreatedBy', CreatedBy.toString());

    return this._httpClient.post<any>(`${this.baseAddress}factapi/Fact/SaveDashboardCards`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  GetDashboardCard1(): Observable<any | string> {
    return this._httpClient.get(`${this.baseAddress}factapi/Fact/GetDashboardCard1`, {
      observe: 'response',
      responseType: 'blob',
      // headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(
        map(response => {
          let fileName = 'file';
          const header = response.headers.get('Content-Disposition');
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(header);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
          const data = {
            image: new Blob([response.body], { type: response.headers.get('Content-Type') }),
            type: response.headers.get('Content-Type'),
            filename: fileName
          };
          return data;
        }),
        catchError(this.errorHandler)
      );
  }
  GetDashboardCard2(): Observable<any | string> {
    return this._httpClient.get(`${this.baseAddress}factapi/Fact/GetDashboardCard2`, {
      observe: 'response',
      responseType: 'blob',
      // headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      // .pipe(catchError(this.errorHandler));
      .pipe(
        map(response => {
          let fileName = 'file';
          const header = response.headers.get('Content-Disposition');
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(header);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
          const data = {
            image: new Blob([response.body], { type: response.headers.get('Content-Type') }),
            type: response.headers.get('Content-Type'),
            filename: fileName
          };
          return data;
        }),
        catchError(this.errorHandler)
      );
  }

  GetAllSEs(): Observable<BPCSE[] | string> {
    return this._httpClient
      .get<BPCSE[]>(
        `${this.baseAddress}factapi/Fact/GetAllSEs`
      )
      .pipe(catchError(this.errorHandler));
  }
  FilterSEs(Criteria: string, ParentCriteria: string, Percentage: number | string | null): Observable<BPCSE[] | string> {
    return this._httpClient
      .get<BPCSE[]>(
        `${this.baseAddress}factapi/Fact/FilterSEs?Criteria=${Criteria}&ParentCriteria=${ParentCriteria}&Percentage=${Percentage}`
      )
      .pipe(catchError(this.errorHandler));
  }
  GetSEsByPartnerID(PartnerID: string): Observable<BPCSE[] | string> {
    return this._httpClient
      .get<BPCSE[]>(
        `${this.baseAddress}factapi/Fact/GetSEsByPartnerID?PartnerID=${PartnerID}`
      )
      .pipe(catchError(this.errorHandler));
  }
  FilterSEByPartnerID(PartnerID: string, Criteria: string, ParentCriteria: string, Percentage: number | string | null): Observable<BPCSE[] | string> {
    return this._httpClient
      .get<BPCSE[]>(
        `${this.baseAddress}factapi/Fact/FilterSEByPartnerID?PartnerID=${PartnerID}&Criteria=${Criteria}&ParentCriteria=${ParentCriteria}&Percentage=${Percentage}`
      )
      .pipe(catchError(this.errorHandler));
  }
  CreateHSN(role: BPCSE): Observable<any> {
    return this._httpClient.post<any>(
      `${this.baseAddress}factapi/Fact/CreateSE`,
      role,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
        }),
      }
    );
  }
  UpdateHSN(role: BPCSE): Observable<any> {
    return this._httpClient.post<any>(
      `${this.baseAddress}factapi/Fact/UpdateSE`,
      role,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
        }),
      }
    );
  }
  DeleteHSN(role: BPCSE): Observable<any> {
    return this._httpClient.post<any>(
      `${this.baseAddress}factapi/Fact/DeleteSE`,
      role,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
        }),
      }
    );
  }
}
