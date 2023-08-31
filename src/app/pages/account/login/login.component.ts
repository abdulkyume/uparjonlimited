import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../core/service/auth.service';
import { EncryptionService } from 'src/app/core/service/encryption.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbAlertModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  submitted: boolean = false;
  error: string = '';
  returnUrl!: string;
  waitloading: boolean = false;
  loginSubscription!: Subscription;

  year: number = new Date().getFullYear();

  userData$!: Observable<any>;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private encryptionservice: EncryptionService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.waitloading = true;
    if (this.loginForm.invalid) {
      this.waitloading = false;
      return;
    } else {
      this.loginSubscription = this.authService
        .login(this.f['email'].value, this.f['password'].value)
        .subscribe({
          error: (err: any) => {
            this.waitloading = false;
            this.error = err ? err : '';
            console.error(err);
          },
          next: (data: any) => {
            this.waitloading = false;

            if (data.reason === 'Change Password') {
              this.router.navigate(['account/change-password']);
            } else if (!data.isSuccess) {
              this.error = data.reason;
            } else {
              localStorage.setItem(
                'isfetchmenu',
                this.encryptionservice.encrypt('YES')
              );
              this.router.navigate(['/dashboard']);
            }
          },
          complete: () => { },
        });
    }
  }

  ngOnDestroy(): void {
    this.loginSubscription.unsubscribe();
  }
}
