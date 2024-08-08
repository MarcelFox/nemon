import { Component, Inject, Input, OnInit, WritableSignal, computed, inject, signal } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Expenses, ExpensesCollection } from '../../../app/content/expenses/interfaces/Expenses.interface';
import { first, tap } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
  providers: [
    {
      provide: 'expensesService',
      useClass: FirestoreService<ExpensesCollection>,
    },
    {
      provide: 'storageService',
      useClass: LocalStorageService,
    },
  ],
})
export class ExpenseListComponent implements OnInit {
  constructor(
    @Inject('expensesService') private expensesService: FirestoreService<ExpensesCollection>,
    @Inject('storageService') private storageService: LocalStorageService,
    @Inject('title') public title: string
  ) {}

  // TODO: Remove type from ExpensesCollection to rely only on collection itself.
  ngOnInit(): void {
    this.expensesService
      .getAll()
      .pipe(
        tap((collection) => {
          collection = collection.filter((doc) => {
            this.collectionData.update(() => [doc]);
            return doc.createdAt.toDate().getMonth() === this.expenseDate.getMonth();
          });
          const docs = collection.flatMap((e) => e.data);
          this.data.update(() => docs);
          this.lastId.update(() => docs.length);
        })
      )
      .subscribe();
  }

  @Input({ required: false }) expenseDate: Date = new Date();

  data: WritableSignal<Expenses[]> = signal([]);
  lastId: WritableSignal<number> = signal(0);
  collectionData: WritableSignal<ExpensesCollection[]> = signal([]);
  collectionId: string = '';
  formChanged: boolean = false;

  expensesForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });

  public totalSum = computed(() =>
    this.data()
      ? this.data().reduce((acc: number, cur: Expenses): number => {
          return acc + cur.value;
        }, 0)
      : 0
  );

  /**
   * Sorts the objects into the Material table.
   * @param sort Sort from material, used to get direction.
   * @param objectsList The objects to be sorted.
   */
  sortData(sort: Sort, objectsList: Expenses[]) {
    objectsList.sort((a, b) => (sort.direction === 'asc' ? a.value - b.value : b.value - a.value));
  }

  removeExpense(elementId: number): void {
    this.data().filter((e) => e.id === elementId);
    const newList = this.data().filter((e: Expenses) => e.id !== elementId);
    newList.forEach((e) => {
      if (e.id >= elementId) {
        e.id = e.id - 1;
      }
    });
    this.data.update(() => newList);
    this.formChanged = true;
  }

  addExpense() {
    this.lastId.update(() => this.lastId() + 1);
    this.data.update(() => [...this.data(), { ...(this.expensesForm.value as Expenses), id: this.lastId() }]);
    this.formChanged = true;
  }

  saveExpense(expensesData: WritableSignal<Expenses[]>) {
    if (this.collectionData().length > 0) {
      this.expensesService.update(this.collectionData()[0].id, { data: expensesData() });
      this.formChanged = false;
    }
  }
}
