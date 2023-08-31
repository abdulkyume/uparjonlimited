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
}
