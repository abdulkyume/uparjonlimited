import { Injectable } from '@angular/core';
import { AES, enc } from "crypto-ts";

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  constructor() {}
  private s3cr38: string = 'takbir-2023-angular';

  encrypt(data: string): string {
    return AES.encrypt(data, this.s3cr38).toString();
  }

  decrypt(encryptedData: string): string {
    if (encryptedData) {
      const bytes = AES.decrypt(encryptedData, this.s3cr38);
      return bytes.toString(enc.Utf8);
    }
    return "";
  }
}
