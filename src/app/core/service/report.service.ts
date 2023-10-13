import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { timeout, catchError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiurl = environment.environment;
  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllOrderReport(
    page: number = 0,
    pageSize: number = 20,
    fromDate: string,
    toDate: string,
    userId: string,
    mercahntId: string
  ) {
    let params;
    if (mercahntId == '' && userId == '') {
      params = new HttpParams()
        .set('page', String(page))
        .set('fromDate', String(fromDate))
        .set('toDate', String(toDate))
        .set('pageSize', String(pageSize));
    } else if (mercahntId == '') {
      params = new HttpParams()
        .set('riderId', String(userId))
        .set('page', String(page))
        .set('fromDate', String(fromDate))
        .set('toDate', String(toDate))
        .set('pageSize', String(pageSize));
    } else if (userId == '') {
      params = new HttpParams()
        .set('page', String(page))
        .set('fromDate', String(fromDate))
        .set('toDate', String(toDate))
        .set('pageSize', String(pageSize));
    } else {
      params = new HttpParams()
        .set('riderId', String(userId))
        .set('merchantId', String(mercahntId))
        .set('page', String(page))
        .set('fromDate', String(fromDate))
        .set('toDate', String(toDate))
        .set('pageSize', String(pageSize));
    }

    return this.http
      .get(`${this.apiurl}report/order`, {
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

  getExpense(fromDate: string, toDate: string) {
    let params = new HttpParams()
      .set('fromDate', String(fromDate))
      .set('toDate', String(toDate));

    return this.http
      .get(`${this.apiurl}report/expense`, {
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

  getExpenseReport(fromDate: string, toDate: string) {
    let params = new HttpParams()
      .set('fromDate', String(fromDate))
      .set('toDate', String(toDate));

    return this.http
      .get(`${this.apiurl}report/expense-report`, {
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
