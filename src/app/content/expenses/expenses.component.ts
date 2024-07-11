import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, WritableSignal, computed, signal, ElementRef, ViewChild, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpensesService } from '../../services/expenses.service';

export interface Expenses {
  id: number;
  detail: string;
  value: number;
}

export interface ExpensesFormData {
  detail: string;
  value: number;
}

export interface ExpensesCollection {
  createdAt: Date;
  data: Expenses[];
  id: string;
  type: string;
}

@Component({
  selector: 'app-expenses',
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
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  expensesService = inject(ExpensesService);

  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) idBonus: WritableSignal<number> = signal(0);
  @Input({ required: true }) idExpenses: WritableSignal<number> = signal(0);

  @ViewChild('expenseValueInputRef') expensesValueInputRef!: ElementRef;
  @ViewChild('bonusValueInputRef') bonusValueInputRef!: ElementRef;

  displayedColumns: string[] = ['detail', 'value'];
  displayedColumns2: string[] = ['total', 'value'];
  expenseChanged: boolean = false;
  bonusChanged: boolean = false;
  expenseLen: number = 0;
  bonusLen: number = 0;

  expensesForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });
  bonusForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });
  ngOnInit() {
    this.initExpenseData(localStorage.getItem('bonus'), this.bonusData, 'bonus');
    this.initExpenseData(localStorage.getItem('expense'), this.expensesData, 'expense');
    this.bonusChanged = !!localStorage.getItem('bonusChanged');
    this.expenseChanged = !!localStorage.getItem('expenseChanged');
  }

  public totalExpenses = computed(() =>
    this.expensesData()
      ? this.expensesData().reduce((acc: number, cur: Expenses): number => {
          return acc + cur.value;
        }, 0)
      : 0
  );
  public totalBonus = computed(() =>
    this.bonusData()
      ? this.bonusData().reduce((acc: number, cur: Expenses): number => {
          return acc + cur.value;
        }, 0)
      : 0
  );

  /**
   * Initialize expenses data looking for the local storage first and then from firestore.
   * @param localStorageData Data stored at local storage
   * @param collectionSignal Signal type of the firestore collection
   * @param expenseType Type of the expense
   */
  private initExpenseData(
    localStorageData: string | null,
    collectionSignal: WritableSignal<Expenses[]>,
    expenseType: string
  ): void {
    if (localStorageData) {
      collectionSignal.update(() => JSON.parse(localStorageData));
      expenseType === 'expense'
        ? this.idBonus.update(() => this.bonusData().length)
        : this.idExpenses.update(() => this.expensesData().length);
    } else {
      this.expensesService.getExpensesByType(expenseType).subscribe((doc) =>
        doc.forEach((e) => {
          collectionSignal.update(() => e.data);
          if (expenseType === 'expense') {
            this.idExpenses.update(() => collectionSignal().length);
          }
          if (expenseType === 'bonus') {
            this.idBonus.update(() => collectionSignal().length);
          }
          localStorage.setItem(expenseType, JSON.stringify(collectionSignal()));
          localStorage.setItem(`id_${expenseType}`, e.id);
        })
      );
    }
  }

  public addElement(expenses: boolean, expenseData: ExpensesFormData) {
    if (expenses) {
      console.log(this.idExpenses());
      this.idExpenses.update((num) => num + 1);
      this.expensesData.update(() => [...this.expensesData(), { ...expenseData, id: this.idExpenses() }]);
      this.expenseChanged = true;
      localStorage.setItem('expenseChanged', '1');
    } else {
      console.log(this.idBonus());
      this.idBonus.update((num) => num + 1);
      this.bonusData.update(() => [...this.bonusData(), { ...expenseData, id: this.idBonus() }]);
      this.bonusChanged = true;
      localStorage.setItem('bonusChanged', '1');
    }
  }

  public removeElement(id: number, expense: boolean = true) {
    if (expense) {
      this.expensesData.update(() => {
        return this.deleteElementById(id, this.expensesData(), expense);
      });
      localStorage.setItem('expense', JSON.stringify(this.expensesData()));
      this.expenseChanged = true;
      localStorage.setItem('expenseChanged', '1');
    } else {
      this.bonusData.update(() => {
        return this.deleteElementById(id, this.bonusData(), expense);
      });
      localStorage.setItem('bonus', JSON.stringify(this.bonusData()));
      this.bonusChanged = true;
      localStorage.setItem('bonusChanged', '1');
    }
  }

  private deleteElementById(id: number, listElements: Expenses[], expense: boolean): Expenses[] {
    const newList = listElements.filter((e: Expenses) => e.id !== id);
    newList.forEach((e) => {
      if (e.id >= id) {
        e.id = e.id - 1;
      }
    });
    expense ? this.idExpenses.update(() => newList.length) : this.idBonus.update(() => newList.length);
    return newList;
  }

  /**
   * Get the value of the key from local storage.
   * @param key Key to be queried.
   * @returns Value of the local storage for thegiven key as string.
   */
  private getKeyFromLocalStorage(key: string): string {
    return localStorage.getItem(key) ?? '';
  }

  sortData(sort: Sort, objectsList: Expenses[]) {
    objectsList.sort((a, b) => (sort.direction === 'asc' ? a.value - b.value : b.value - a.value));
  }

  /**
   * Submit form.
   * @param expenses True if expense data, False if bonus data
   */
  onSubmitExpense() {
    this.addElement(true, this.expensesForm.value as ExpensesFormData);
    this.expensesForm.reset();
    this.expensesValueInputRef.nativeElement.focus();
    localStorage.setItem('expense', JSON.stringify(this.expensesData()));
  }
  onSubmitBonus() {
    this.addElement(false, this.bonusForm.value as ExpensesFormData);
    this.bonusForm.reset();
    this.bonusValueInputRef.nativeElement.focus();
    localStorage.setItem('bonus', JSON.stringify(this.bonusData()));
  }

  onSave(expenseType: string, collectionSignal: WritableSignal<Expenses[]>) {
    const idFirestoreCollection = localStorage.getItem(`id_${expenseType}`);
    if (!idFirestoreCollection) {
      this.expensesService
        .addExpense(collectionSignal(), expenseType)
        .subscribe((id) => alert(`${expenseType} added with id ${id}`));
    } else {
      this.expensesService.updateExpenseData(idFirestoreCollection, collectionSignal());
      expenseType === 'expense'
        ? localStorage.setItem('expense', JSON.stringify(collectionSignal()))
        : localStorage.setItem('bonus', JSON.stringify(collectionSignal()));
    }
    expenseType === 'expense' ? (this.expenseChanged = false) : (this.bonusChanged = false);
    expenseType === 'expense' ? localStorage.removeItem('expenseChanged') : localStorage.removeItem('bonusChanged');
  }
}
