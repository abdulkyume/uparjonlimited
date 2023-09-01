import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import { Subject, takeUntil } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationService } from 'src/app/core/service/configuration.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPaginationModule,
  ],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  showAddBtn: boolean = true;
  itemForm!: FormGroup;
  itemSForm!: FormGroup;

  itemList: any;

  page: number = 0;
  pageSize: number = 10;
  cPageVal: number = 1;
  toPageVal!: number;
  total!: number;

  constructor(
    private formBuilder: FormBuilder,
    private configservice: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.itemRefreshForm();
    this.itemSRefreshForm();
    this.getallItem();
  }

  itemRefreshForm() {
    this.itemForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      price: ['', [Validators.required]],
    });
  }

  itemSRefreshForm() {
    this.itemSForm = this.formBuilder.group({
      name: [''],
    });
  }

  onPageChange(event: number) {
    this.loader = true;
    this.toPageVal = event * this.pageSize;
    this.page = event;

    this.cPageVal = (event - 1) * this.pageSize + 1;

    if (this.toPageVal > this.total) {
      this.toPageVal = this.total;
    }
    this.getallItem();
    return event;
  }

  getallItem() {
    this.configservice
      .getAllItem(
        this.page,
        this.pageSize,
        this.itemSForm.controls['name'].value
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.itemList = res.data.content;
          this.total = res.data.totalElements!;
          if (this.toPageVal > this.total) {
            this.toPageVal = this.total;
          } else {
            this.toPageVal = this.itemList.length;
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

  successmsg(message: string) {
    Swal.fire('Success!', message, 'success');
  }
  errorssmsg(message: string) {
    Swal.fire('Ops!', message, 'error');
  }

  editItem(data: any) {
    this.itemForm.controls['id'].setValue(data.id);
    this.itemForm.controls['name'].setValue(data.name);
    this.itemForm.controls['price'].setValue(data.price);
    this.showAddBtn = false;
  }
  onsubmit() {
    this.loader = true;
    if (this.itemForm.controls['id'].value) {
      this.configservice
        .updateitem(this.itemForm.value)
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
        .additem(this.itemForm.value)
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
