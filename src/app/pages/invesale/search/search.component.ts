import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventorySalesService } from 'src/app/core/service/inventory-sales.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatListModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  private ngUnsubscribe: Subject<any> = new Subject();
  searchNumber: string = '';
  searchResults: any[] = [];
  newShopName: string = '';

  @Output() selectedShop = new EventEmitter();

  constructor(private searchService: InventorySalesService) {}

  onSearchChange(event: any) {
    if (this.searchNumber) {
      this.getAllShop();
    } else {
      this.searchResults = [];
    }
  }

  getAllShop(): void {
    this.searchService
      .getAllShop(-1, -1, this.searchNumber)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.searchResults = res.data;
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {},
      });
  }

  selectResult(result: any) {
    // Add selected result to the relative form
    // Implement this based on your form structure
    this.selectedShop.emit(result);
    this.searchNumber = '';
    this.searchResults = [];
  }

  addNewEntry() {
    let reg = /^(01[3-9]\d{8})$/;
    if (this.searchNumber && reg.test(this.searchNumber)) {
      const newEntry = {
        phoneNumber: this.searchNumber,
        name: this.newShopName,
      };
      this.searchService.addShop(newEntry).subscribe((res) => {
        if (!res.isSuccess) {
          this.errorssmsg(res.reason);
        } else {
          this.successmsg(res.reason);
          this.searchNumber = '';
          this.searchResults = [];
        }
      });
    }
  }

  successmsg(message: string): void {
    Swal.fire('Success!', message, 'success');
  }

  errorssmsg(message: string): void {
    Swal.fire('Ops!', message, 'error');
  }
}
