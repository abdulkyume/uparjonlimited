import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { EncryptionService } from 'src/app/core/service/encryption.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  isLoggedIn: boolean = false;
  private apiurl = environment.environment;

  constructor(
    private http: HttpClient,
    private router: Router,
    private encryptionservice: EncryptionService
  ) {
    if (localStorage.getItem("currentUser")) {
      this.currentUserSubject = new BehaviorSubject<any>(
        JSON.parse(
          this.encryptionservice.decrypt(localStorage.getItem("currentUser")!)
        )
      );
    }
    else {
      this.currentUserSubject = new BehaviorSubject<any>(
        JSON.parse(localStorage.getItem("currentUser")!)
      );
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiurl}auth/signin`, {
        email,
        password,
      })
      .pipe(
        map((res: any) => {
          if (res && res.data.refreshToken) {
            localStorage.setItem('currentUser', this.encryptionservice.encrypt(JSON.stringify(res.data)));
            localStorage.setItem(
              'username',
              this.encryptionservice.encrypt(email)
            );
            localStorage.setItem('role', this.encryptionservice.encrypt(res.data.roleId));
            this.currentUserSubject.next(res.data);
            this.isLoggedIn = true;
          }
          return res;
        }),
        catchError((err) => {
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

  logout() {
    let user = localStorage.getItem('username');

    localStorage.removeItem('currentUser');
    localStorage.removeItem('getMenuWeb');
    localStorage.removeItem('getRoleWiseMenu');
    localStorage.removeItem('allroleid');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('expires');
    localStorage.removeItem('menus');
    localStorage.setItem('isfetchmenu', this.encryptionservice.encrypt('YES'));

    this.currentUserSubject.next(null!);
    this.isLoggedIn = false;
    this.router.navigate(["/account/login"]);
  }

  changepassword(currentPassword: string, newPassword: string) {
    let user = JSON.parse(
      this.encryptionservice.decrypt(localStorage.getItem("currentUser")!)
    );
    let reqm = {
      id: user.id,
      active: true,
      deleted: false,
      userName: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      mobile: user.mobile,
      email: user.email,
      password: newPassword,
      roleId: user.roleId
    }
    return this.http
      .post(this.apiurl + 'user/update-userp', reqm)
      .pipe(
        timeout(60000),
        catchError((err: any) => {
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

  getRoleWiseMenu(): Observable<any> {
    let user = JSON.parse(this.encryptionservice.decrypt(
      localStorage.getItem('currentUser')!
    ))
    let reqmodel = {
      roleId: user.roleId
    }
    return this.http
      .post<any>(`${this.apiurl}menu/getRoleWiseMenu`, reqmodel)
      .pipe(
        timeout(60000),
        catchError((err: any) => {
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
}
