import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Baseresponse } from '../models/baseresponse';
import { Baseresponsewlist } from '../models/baseresponsewlist';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  apiURL: string = environment.environment;
  constructor(private http: HttpClient) {}

  getAllRoleId(page: number = 1, limit: number = 10, sort: string = 'desc') {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(limit))
      .set('sort', String(sort));
    return this.http.get(`${this.apiURL}Roles/getAllRoleId`, { params }).pipe(
      timeout(60000),
      catchError((err) => {
        console.log(err);
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
  
  getAllRoleIds(): Observable<Baseresponse<any>> {
    return this.http
      .get<Baseresponse<any>>(`${this.apiURL}role/all_role`)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.log(err);
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

  getAllusers(
    page: number = 0,
    limit: number = 10,
    searchValue: string = ''
  ): Observable<Baseresponsewlist<any>> {
    var params = new HttpParams()
      .set('pageNumber', Number(page))
      .set('pageSize', Number(limit))
      .set('searchVal', String(searchValue));
    return this.http
      .get<Baseresponsewlist<any>>(
        `${this.apiURL}user/get-user`,
        { params }
      )
      .pipe(
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

  createUser(newUser: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}Account/signup`, newUser).pipe(
      timeout(60000),
      catchError((err) => {
        console.log(err);
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

  updateUser(newUser: any) {
    var apiurl = environment.environment;
    return this.http
      .put<any>(`${apiurl}Account/UpdateUser/${newUser.id}`, newUser)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.log(err);
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

  getMenuWeb(): Observable<Baseresponse<any>> {
    return this.http
      .get<Baseresponse<any>>(`${this.apiURL}Roles/getMenuWeb`)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.log(err);
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

  updateMenuWeb(item: any) {
    return this.http.put(`${this.apiURL}Roles/updateMenuWeb`, item).pipe(
      timeout(60000),
      catchError((err) => {
        console.log(err);
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

  getRoleWiseMenu(): Observable<Baseresponse<any>> {
    return this.http
      .get<Baseresponse<any>>(`${this.apiURL}Roles/getRoleWiseMenu`)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.log(err);
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

  createRole(newRole: any) {
    var apiurl = environment.environment;
    return this.http.post<any>(`${apiurl}Roles/addNewRole`, newRole).pipe(
      timeout(60000),
      catchError((err) => {
        console.log(err);
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

  updateRole(newRole: any) {
    return this.http.put<any>(`${this.apiURL}Roles/updateRole`, newRole).pipe(
      timeout(60000),
      catchError((err) => {
        console.log(err);
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

  insertUpdateRoleWiseMenu(requestModel: any) {
    return this.http
      .post<any>(`${this.apiURL}Roles/AddNewRole`, requestModel)
      .pipe(
        timeout(60000),
        catchError((err) => {
          console.log(err);
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
