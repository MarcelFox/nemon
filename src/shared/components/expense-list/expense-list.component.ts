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
    console.log(this.storageService.get('expenses'));
    this.expensesService
      .getAll()
      .pipe(
        tap((collection) => {
          const docs = collection.flatMap((e) => e.data);
          this.data.update(() => docs);
        })
      )
      .subscribe();
  }

  data: WritableSignal<Expenses[]> = signal([]);

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

  removeElement(elementId: number): void {
    console.log(`REMOVING: ${elementId}`);
  }

  onAddExpense(formGroupData: FormGroup, expenseData: WritableSignal<Expenses[]>, expense: string) {
    console.log('lol');
  }

  onSave(expenseData: WritableSignal<Expenses[]>) {
    console.log(`SAVING: ${expenseData}`);
  }
}
