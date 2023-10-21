import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { timeout, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class MerchantService {
  private apiurl = environment.environment;

  constructor(private http: HttpClient, private authService: AuthService) { }

  addMerchantForm(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}merchant/addMerchant`, newUser).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (
          err === 'Unauthorized user.' ||
          err.message === 'Unauthorized user.'
        ) {
          this.authService.logout();
        }
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
        }
        if (err === 'Bad Request') {
          Swal.fire('Error!!', 'Form Submission Error');
        }
        if (err === 'Unknown Error') {
          Swal.fire('Error!!', 'No Connection Found');
        }
        if (
          err.message === "Cannot read properties of null (reading 'message')"
        ) {
          Swal.fire(
            'Error!!',
            'Resource Not Available. Link is Not Working',
            'error'
          );
        }
        throw err;
      })
    );
  }

  updateMerchant(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}merchant/updateMerchant`, newUser).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (
          err === 'Unauthorized user.' ||
          err.message === 'Unauthorized user.'
        ) {
          this.authService.logout();
        }
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
        }
        if (err === 'Bad Request') {
          Swal.fire('Error!!', 'Form Submission Error');
        }
        if (err === 'Unknown Error') {
          Swal.fire('Error!!', 'No Connection Found');
        }
        if (
          err.message === "Cannot read properties of null (reading 'message')"
        ) {
          Swal.fire(
            'Error!!',
            'Resource Not Available. Link is Not Working',
            'error'
          );
        }
        throw err;
      })
    );
  }

  getMercahnt(page: number = 0, limit: number = 10, searchVal: string = '') {
    let params = new HttpParams()
      .set('name', String(searchVal))
      .set('page', String(page))
      .set('pageSize', String(limit));

    return this.http
      .get(`${this.apiurl}merchant/getMerchant`, {
        params,
      })
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (
            err === 'Unauthorized user.' ||
            err.message === 'Unauthorized user.'
          ) {
            this.authService.logout();
          }
          if (err.name === 'TimeoutError') {
            Swal.fire('Time Out!!', 'Internal Server Problem');
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              'Error!!',
              'Resource Not Available. Link is Not Working',
              'error'
            );
          }
          if (err === 'Bad Request') {
            Swal.fire('Error!!', 'Form Submission Error');
          }
          if (err === 'Unknown Error') {
            Swal.fire('Error!!', 'No Connection Found');
          }
          throw err;
        })
      );
  }

  getMerchantDetail(
    merchantId: string,
    page: number = 0,
    limit: number = 10,
    searchVal: string = ''
  ) {
    let params = new HttpParams()
      .set('merchantId', String(merchantId))
      .set('name', String(searchVal))
      .set('page', String(page))
      .set('pageSize', String(limit));

    return this.http
      .get(`${this.apiurl}merchant/getMerchantDetail`, {
        params,
      })
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (
            err === 'Unauthorized user.' ||
            err.message === 'Unauthorized user.'
          ) {
            this.authService.logout();
          }
          if (err.name === 'TimeoutError') {
            Swal.fire('Time Out!!', 'Internal Server Problem');
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              'Error!!',
              'Resource Not Available. Link is Not Working',
              'error'
            );
          }
          if (err === 'Bad Request') {
            Swal.fire('Error!!', 'Form Submission Error');
          }
          if (err === 'Unknown Error') {
            Swal.fire('Error!!', 'No Connection Found');
          }
          throw err;
        })
      );
  }

  addMerchantDetail(newUser: any) {
    var apiurl = environment.environment;
    return this.http
      .post<any>(`${apiurl}merchant/addMerchantDetail`, newUser)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (
            err === 'Unauthorized user.' ||
            err.message === 'Unauthorized user.'
          ) {
            this.authService.logout();
          }
          if (err.name === 'TimeoutError') {
            Swal.fire('Time Out!!', 'Internal Server Problem');
          }
          if (err === 'Bad Request') {
            Swal.fire('Error!!', 'Form Submission Error');
          }
          if (err === 'Unknown Error') {
            Swal.fire('Error!!', 'No Connection Found');
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              'Error!!',
              'Resource Not Available. Link is Not Working',
              'error'
            );
          }
          throw err;
        })
      );
  }

  updateMerchantDetail(newUser: any) {
    var apiurl = environment.environment;
    return this.http
      .put<any>(`${apiurl}merchant/updateMerchantDetail`, newUser)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (
            err === 'Unauthorized user.' ||
            err.message === 'Unauthorized user.'
          ) {
            this.authService.logout();
          }
          if (err.name === 'TimeoutError') {
            Swal.fire('Time Out!!', 'Internal Server Problem');
          }
          if (err === 'Bad Request') {
            Swal.fire('Error!!', 'Form Submission Error');
          }
          if (err === 'Unknown Error') {
            Swal.fire('Error!!', 'No Connection Found');
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              'Error!!',
              'Resource Not Available. Link is Not Working',
              'error'
            );
          }
          throw err;
        })
      );
  }

  addOrder(reqm: any) {
    return this.http.post<any>(`${this.apiurl}merchant/add-order`, reqm).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (
          err === 'Unauthorized user.' ||
          err.message === 'Unauthorized user.'
        ) {
          this.authService.logout();
        }
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
        }
        if (err === 'Bad Request') {
          Swal.fire('Error!!', 'Form Submission Error');
        }
        if (err === 'Unknown Error') {
          Swal.fire('Error!!', 'No Connection Found');
        }
        if (
          err.message === "Cannot read properties of null (reading 'message')"
        ) {
          Swal.fire(
            'Error!!',
            'Resource Not Available. Link is Not Working',
            'error'
          );
        }
        throw err;
      })
    );
  }

  updateOrder(reqm: any) {
    return this.http.post<any>(`${this.apiurl}merchant/update-order`, reqm).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (
          err === 'Unauthorized user.' ||
          err.message === 'Unauthorized user.'
        ) {
          this.authService.logout();
        }
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
        }
        if (err === 'Bad Request') {
          Swal.fire('Error!!', 'Form Submission Error');
        }
        if (err === 'Unknown Error') {
          Swal.fire('Error!!', 'No Connection Found');
        }
        if (
          err.message === "Cannot read properties of null (reading 'message')"
        ) {
          Swal.fire(
            'Error!!',
            'Resource Not Available. Link is Not Working',
            'error'
          );
        }
        throw err;
      })
    );
  }

  getOrder(page: number = 0, limit: number = 10, id: string = '', status: string = '', fromDate: string = '', toDate: string = '') {
    let params = new HttpParams()
      .set('id', String(id))
      .set('status', String(status))
      .set('fromDate', String(id))
      .set('toDate', String(id))
      .set('page', String(page))
      .set('pageSize', String(limit));

    return this.http
      .get(`${this.apiurl}merchant/get-order`, {
        params,
      })
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (
            err === 'Unauthorized user.' ||
            err.message === 'Unauthorized user.'
          ) {
            this.authService.logout();
          }
          if (err.name === 'TimeoutError') {
            Swal.fire('Time Out!!', 'Internal Server Problem');
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              'Error!!',
              'Resource Not Available. Link is Not Working',
              'error'
            );
          }
          if (err === 'Bad Request') {
            Swal.fire('Error!!', 'Form Submission Error');
          }
          if (err === 'Unknown Error') {
            Swal.fire('Error!!', 'No Connection Found');
          }
          throw err;
        })
      );
  }
}
