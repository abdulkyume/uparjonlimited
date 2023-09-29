import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/service/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-passwordreset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbAlertModule],
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss'],
})
export class PasswordresetComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<any> = new Subject();
  resetForm!: FormGroup;
  submitted: boolean = false;
  error: string = '';
  success: string = '';
  loading: boolean = false;

  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.resetForm = this.formBuilder.group({
      curpass: ['', [Validators.required]],
      newpass: ['', [Validators.required]],
      newpass2: ['', [Validators.required]],
    });
  }

  get f() {
    return this.resetForm.controls;
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    this.submitted = true;

    if (this.resetForm.invalid) {
      return;
    }
    const curpass = this.f['curpass'].value;
    const newpass = this.f['newpass'].value;
    const newpass2 = this.f['newpass2'].value;

    if (curpass === newpass) {
      this.error = 'Current password is not acceptable as new password';
      return;
    }
    if (newpass !== newpass2) {
      this.error = 'New password and Retype new password should be same';
      return;
    }

    this.authService.changepassword(curpass, newpass).subscribe((res: any) => {
      if (!res.isSuccess) {
        this.error = res.reason;
      } else {
        this.timer();
        this.logout();
      }
    });
  }

  timer() {
    let timerInterval: any;
    Swal.fire({
      title: 'Password Change Successfull',
      html: 'Your password changed successfully, please login with new password',
      timer: 3000,

      didOpen: () => {
        Swal.showLoading();
        timerInterval = setInterval(() => {
          const content = Swal.getHtmlContainer();
          if (content) {
            const b = content.querySelector('b');
            if (b) {
              b.textContent = Swal.getTimerLeft() + '';
            }
          }
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/account/login']);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
