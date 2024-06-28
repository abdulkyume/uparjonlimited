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
    console.log(newUser)
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
}
