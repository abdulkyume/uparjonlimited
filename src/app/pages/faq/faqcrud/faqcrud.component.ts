import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FaqService } from 'src/app/core/service/faq.service';
import Swal from 'sweetalert2';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-faqcrud',
  standalone: true,
  imports: [
    CommonModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    LoaderComponent,
    CKEditorModule,
  ],
  templateUrl: './faqcrud.component.html',
  styleUrls: ['./faqcrud.component.scss'],
})
export class FaqcrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  public Editor = ClassicEditor;
  loader: boolean = false;
  showAddBtn: boolean = true;
  itemForm!: FormGroup;

  itemList: any;

  constructor(
    private formBuilder: FormBuilder,
    private configservice: FaqService
  ) {}

  ngOnInit(): void {
    this.itemRefreshForm();
    this.getallItem();
  }

  itemRefreshForm() {
    this.itemForm = this.formBuilder.group({
      id: [null],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      serial: [1, [Validators.required]],
    });
  }

  getallItem() {
    this.configservice
      .getAllFaq()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.itemList = res.data;
          this.itemList.sort((a: any, b: any) => a.serial - b.serial);
        },
        error: (err: any) => {
          console.error(err);
          this.loader = false;
        },
        complete: () => {
          this.loader = false;
        },
      });
  }

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  editItem(data: any) {
    this.itemForm.controls['id'].setValue(data.id);
    this.itemForm.controls['title'].setValue(data.title);
    this.itemForm.controls['description'].setValue(data.description);
    this.itemForm.controls['serial'].setValue(data.serial);
    this.showAddBtn = false;
  }
  onsubmit() {
    this.loader = true;
    if (this.itemForm.controls['id'].value) {
      this.configservice
        .updateFaq(this.itemForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.itemRefreshForm();
              this.showAddBtn = true;
              this.getallItem();
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.loader = false;
          },
        });
    } else {
      this.configservice
        .addFaq(this.itemForm.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.isSuccess) {
              this.loader = false;
              this.errorssmsg(res.reason);
            } else {
              this.successmsg(res.reason);
              this.itemRefreshForm();
              this.showAddBtn = true;
              this.getallItem();
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loader = false;
          },
          complete: () => {
            this.loader = false;
          },
        });
    }
  }

  toggleAddBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
