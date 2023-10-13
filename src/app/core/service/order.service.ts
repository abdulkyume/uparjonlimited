import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiurl = environment.environment;
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllOrder(page: number = 0, pageSize: number = 10, fromDate: string, toDate: string, userId: string) {
    let params = new HttpParams()
      .set("userId", String(userId))
      .set("page", String(page))
      .set("fromDate", String(fromDate))
      .set("toDate", String(toDate))
      .set("pageSize", String(pageSize));

    return this.http
      .get(
        `${this.apiurl}order/get-order`,
        {
          params,
        }
      )
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (err === "Unauthorized user." || err.message === "Unauthorized user.") {
            this.authService.logout();
          }
          if (err.name === "TimeoutError") {
            Swal.fire("Time Out!!", "Internal Server Problem");
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              "Error!!",
              "Resource Not Available. Link is Not Working",
              "error"
            );
          }
          if (err === "Bad Request") {
            Swal.fire("Error!!", "Form Submission Error");
          }
          if (err === "Unknown Error") {
            Swal.fire("Error!!", "No Connection Found");
          }
          throw err;
        })
      );
  }

  getAllOrderDetail(fromDate: string, toDate: string, userId: string, orderId: string) {

    let params = new HttpParams()
      .set("userId", String(userId))
      .set("orderId", String(orderId))
      .set("fromDate", String(fromDate))
      .set("toDate", String(toDate));

    return this.http
      .get(
        `${this.apiurl}order/get-order-detail`,
        {
          params,
        }
      )
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.error(err);
          if (err === "Unauthorized user." || err.message === "Unauthorized user.") {
            this.authService.logout();
          }
          if (err.name === "TimeoutError") {
            Swal.fire("Time Out!!", "Internal Server Problem");
          }
          if (
            err.message === "Cannot read properties of null (reading 'message')"
          ) {
            Swal.fire(
              "Error!!",
              "Resource Not Available. Link is Not Working",
              "error"
            );
          }
          if (err === "Bad Request") {
            Swal.fire("Error!!", "Form Submission Error");
          }
          if (err === "Unknown Error") {
            Swal.fire("Error!!", "No Connection Found");
          }
          throw err;
        })
      );
  }

  getAllexpense(page: number = 0, limit: number = 10, searchValue: string = '', fromDate: string = "", toDate: string = "") {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('userId', String(searchValue))
      .set('fromDate', String(fromDate))
      .set('toDate', String(toDate));
    return this.http.get(`${this.apiurl}expense/get-expense`, { params }).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
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

  addExpense(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}expense/add-expense`, newUser).pipe(
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

  updateExpense(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}expense/update-expense`, newUser).pipe(
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

  addOrder(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}order/create-order`, newUser).pipe(
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

  updateOrder(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}order/update-order`, newUser).pipe(
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
}
