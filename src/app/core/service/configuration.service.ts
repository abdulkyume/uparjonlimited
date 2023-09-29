import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private apiurl = environment.environment;
  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllItem(page: number = 0, limit: number = 10, searchValue: string = '') {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('name', String(searchValue));
    return this.http.get(`${this.apiurl}item/get-item`, { params }).pipe(
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

  additem(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}item/add-item`, newUser).pipe(
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

  updateitem(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}item/update-item`, newUser).pipe(
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

  getAllZone(page: number = 0, limit: number = 10, searchValue: string = '') {
    var params = new HttpParams()
      .set('page', Number(page))
      .set('pageSize', Number(limit))
      .set('name', String(searchValue));
    return this.http.get(`${this.apiurl}pickndrop/get-zone`, { params }).pipe(
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

  addZone(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}pickndrop/add-zone`, newUser).pipe(
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

  updateZone(newUser: any) {
    var apiurl = environment.environment;
    return this.http.put<any>(`${apiurl}pickndrop/update-zone`, newUser).pipe(
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
