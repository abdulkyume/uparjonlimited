import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { catchError, timeout } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class InventorySalesService {
  private apiurl = environment.environment;
  private dueEntry: string = 'inventory-sales/due';
  private invEntry: string = 'inventory-sales/inventory';
  private shopEntry: string = 'inventory-sales/shop';
  private invDetEntry: string = 'inventory-sales/inventory-details';

  private http = inject(HttpClient)
  private authService = inject(AuthService)

  getAllDue(
    page: number = 0,
    limit: number = 10,
    inventoryItemId: string = '',
    shopId: string = '',
    orderId: string = '',
    dsoId: string = '',
  ) {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('inventoryItemId', String(inventoryItemId))
      .set('shopId', String(shopId))
      .set('dsoId', String(dsoId))
      .set('orderId', String(orderId));
    return this.http.get(`${this.apiurl}${this.dueEntry}/get`, { params }).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
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

  addDue(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}${this.dueEntry}/add`, newUser).pipe(
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
        throw err;
      })
    );
  }

  updateDue(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}${this.dueEntry}/update`, newUser).pipe(
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

  deleteDue(id: any) {
    var apiurl = environment.environment;
    return this.http.delete<any>(`${apiurl}${this.dueEntry}/delete/${id}`).pipe(
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
        throw err;
      })
    );
  }

  getAllInventory(
    page: number = 0,
    limit: number = 10,
    name: string = '',
    vendor: string = '',
  ) {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('name', String(name))
      .set('vendor', String(vendor));
    return this.http.get(`${this.apiurl}${this.invEntry}/get`, { params }).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
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

  addInventory(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}${this.invEntry}/add`, newUser).pipe(
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
        throw err;
      })
    );
  }

  updateInventory(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}${this.invEntry}/update`, newUser).pipe(
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

  deleteInventory(id: any) {
    var apiurl = environment.environment;
    return this.http.delete<any>(`${apiurl}${this.invEntry}/delete/${id}`).pipe(
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
        throw err;
      })
    );
  }

  getAllShop(
    page: number = 0,
    limit: number = 10,
    phoneNumber: string = '',
  ) {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('phoneNumber', String(phoneNumber));
    return this.http.get(`${this.apiurl}${this.shopEntry}/get`, { params }).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
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

  addShop(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}${this.shopEntry}/add`, newUser).pipe(
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
        throw err;
      })
    );
  }

  updateShop(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}${this.shopEntry}/update`, newUser).pipe(
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

  deleteShop(id: any) {
    var apiurl = environment.environment;
    return this.http.delete<any>(`${apiurl}${this.shopEntry}/delete/${id}`).pipe(
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
        throw err;
      })
    );
  }

  getAllInvDet(
    page: number = 0,
    limit: number = 10,
    inventoryId: string = '',
    type: string = '',
    unit: string = '',
  ) {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('type', String(type))
      .set('unit', String(unit))
      .set('inventoryId', String(inventoryId));
    return this.http.get(`${this.apiurl}${this.invDetEntry}/get`, { params }).pipe(
      timeout(60000),
      catchError((err) => {
        console.error(err);
        if (err.name === 'TimeoutError') {
          Swal.fire('Time Out!!', 'Internal Server Problem');
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

  addInvDet(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}${this.invDetEntry}/add`, newUser).pipe(
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
        throw err;
      })
    );
  }

  updateInvDet(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}${this.invDetEntry}/update`, newUser).pipe(
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

  deleteInvDet(id: any) {
    var apiurl = environment.environment;
    return this.http.delete<any>(`${apiurl}${this.invDetEntry}/delete/${id}`).pipe(
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
        throw err;
      })
    );
  }
}
