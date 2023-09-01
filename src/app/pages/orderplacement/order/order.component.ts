import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { LoaderComponent } from 'src/app/common/loader/loader.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from 'src/app/core/service/order.service';
import { EncryptionService } from '../../../core/service/encryption.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfigurationService } from 'src/app/core/service/configuration.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  loader: boolean = false;
  showAddBtn: boolean = true;
  orderForm!: FormGroup;
  searchForm!: FormGroup;
  slubform!: FormGroup;
  userid: string = '';
  page: number = 0;
  pageSize: number = 10;

  merchantList: any;
  itemList: any;

  dropdownSettings = {};
  dropdownList = [];
  selectedItems = [];
  dropdownList1: any;
  selectedItems1 = [];

  currentdate: string = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private encryptionService: EncryptionService,
    private configService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.orderRefreshForm();
    this.getitemlist();
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'customtext',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
    this.userid = JSON.parse(
      this.encryptionService.decrypt(localStorage.getItem('currentUser')!)
    ).id;
    this.slubform = this.formBuilder.group({
      slubformval: this.formBuilder.array([]),
    });
  }

  getitemlist() {
    let ilist: any[] = [];
    this.configService.getAllItem(0, 1000, '').subscribe({
      next: (res: any) => {
        res.data.content.map((x: any) => {
          ilist.push({
            id: x.id,
            customtext: x.name,
          });
        });
      },
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        this.dropdownList1 = ilist;
      },
    });
  }

  orderRefreshForm() {
    this.orderForm = this.formBuilder.group({
      id: [null],
      userId: ['', Validators.required],
      orderDate: ['', Validators.required],
      otherNote: [''],
      paymentTypeId: ['COD Received'],
      receivedAmount: [''],
      orderDetails: [],
    });
  }

  get f() {
    return this.orderForm.controls;
  }

  get sf() {
    return this.searchForm.controls;
  }

  slubdata(): FormArray {
    return this.slubform.get('slubformval') as FormArray;
  }

  setnameforstakeholder(event: any, index: any) {
    let f = this.merchantList.filter((x: any) => x.id == event);
    this.slubdata().controls[index].patchValue({
      TransactionFeeStakeHolderName: f[0].stakeholderName,
    });
  }

  onInitiatorItemSelect(item: any) {
    // this.slubdata().controls.patchValue({
    //   StackHolderInfromationId: item.id,
    // });
    // this.setnameforstakeholder(item.id, index);
  }

  onInitiatorItemUnSelect(item: any) {
    // this.slubdata().controls.patchValue({
    //   StackHolderInfromationId: null,
    // });
    // this.slubdata().controls.patchValue({
    //   TransactionFeeStakeHolderName: "",
    // });
  }

  onInitiatorItemSelect1(item: any) {
    // this.slubdata().controls.patchValue({
    //   StackHolderInfromationId: item.id,
    // });
    // this.setnameforstakeholder(item.id, index);
  }

  onInitiatorItemUnSelect1(item: any) {
    // this.slubdata().controls.patchValue({
    //   StackHolderInfromationId: null,
    // });
    // this.slubdata().controls.patchValue({
    //   TransactionFeeStakeHolderName: "",
    // });
  }

  searchRefreshForm() {
    this.searchForm = this.formBuilder.group({
      fromdate: [''],
      todate: [''],
    });
    this.getAllOrderList();
  }

  getAllOrderList() {
    this.orderService.getAllOrder(
      this.page,
      this.pageSize,
      this.sf['fromdate'].value,
      this.sf['toDate'].value,
      this.userid
    );
  }

  toggleAddOrderBtn() {
    this.showAddBtn ? (this.showAddBtn = false) : (this.showAddBtn = true);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
  }
}
