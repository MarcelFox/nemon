import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, WritableSignal, computed, signal, ElementRef, ViewChild, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpensesService } from '../../services/expenses.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Timestamp } from '@angular/fire/firestore';

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
  createdAt: Timestamp;
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
  localStorageService = inject(LocalStorageService);

  @Input({ required: true }) months: WritableSignal<{ id: number; date: Date }[]> = signal([]);
  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) idBonus: WritableSignal<number> = signal(0);
  @Input({ required: true }) idExpenses: WritableSignal<number> = signal(0);
  @Input({ required: true }) activeMonthId: WritableSignal<number> = signal(0);

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
    this.initExpenseData(this.localStorageService.get('bonus'), this.bonusData, 'bonus');
    this.initExpenseData(this.localStorageService.get('expense'), this.expensesData, 'expense');
    this.bonusChanged = !!this.localStorageService.get('bonusChanged');
    this.expenseChanged = !!this.localStorageService.get('expenseChanged');
    this.idBonus.update(() => Number(this.localStorageService.get('idBonus')));
    this.idExpenses.update(() => Number(this.localStorageService.get('idExpenses')));
  }

  public onMonthClick(id: number) {
    this.activeMonthId.update(() => id);
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
    this.expensesService
      .getExpensesDates()
      .subscribe((e) => this.months.update(() => e));
    if (localStorageData) {
      collectionSignal.update(() => JSON.parse(localStorageData));
      expenseType === 'expense'
        ? this.idExpenses.update(() => this.bonusData().length)
        : this.idBonus.update(() => this.expensesData().length);
    } else {
      this.expensesService.getExpensesByType(expenseType).subscribe((doc) =>
        doc.forEach((e) => {
          collectionSignal.update(() => e.data);
          if (expenseType === 'expense') {
            this.idExpenses.update(() => collectionSignal().length);
            this.localStorageService.set('idExpenses', `${this.idExpenses()}`);
          }
          if (expenseType === 'bonus') {
            this.idBonus.update(() => collectionSignal().length);
            this.localStorageService.set('idBonus', `${this.idBonus()}`);
          }
          this.localStorageService.set(expenseType, JSON.stringify(collectionSignal()));
          this.localStorageService.set(`id_${expenseType}`, e.id);
        })
      );
    }
  }

  public addElement(expenses: boolean, expenseData: ExpensesFormData) {
    if (expenses) {
      this.idExpenses.update((num) => num + 1);
      this.expensesData.update(() => [...this.expensesData(), { ...expenseData, id: this.idExpenses() }]);
      this.expenseChanged = true;
      this.localStorageService.set('expenseChanged', '1');
      this.localStorageService.set('idExpenses', `${this.idExpenses()}`);
    } else {
      this.idBonus.update((num) => num + 1);
      this.bonusData.update(() => [...this.bonusData(), { ...expenseData, id: this.idBonus() }]);
      this.bonusChanged = true;
      this.localStorageService.set('bonusChanged', '1');
      this.localStorageService.set('idBonus', `${this.idBonus()}`);
    }
  }

  public removeElement(id: number, expense: boolean = true) {
    if (expense) {
      this.expensesData.update(() => {
        return this.deleteElementById(id, this.expensesData(), expense);
      });
      this.localStorageService.set('expense', JSON.stringify(this.expensesData()));
      this.expenseChanged = true;
      this.localStorageService.set('expenseChanged', '1');
      this.localStorageService.set('idExpenses', `${this.idExpenses()}`);
    } else {
      this.bonusData.update(() => {
        return this.deleteElementById(id, this.bonusData(), expense);
      });
      this.localStorageService.set('bonus', JSON.stringify(this.bonusData()));
      this.bonusChanged = true;
      this.localStorageService.set('bonusChanged', '1');
      this.localStorageService.set('idBonus', `${this.idBonus()}`);
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

  sortData(sort: Sort, objectsList: Expenses[]) {
    objectsList.sort((a, b) => (sort.direction === 'asc' ? a.value - b.value : b.value - a.value));
  }

  /**
   * Add a new expense into the expenses collection 'data' array.
   * @param formGroupData Form group data to be readed.
   * @param expenseData Expense signal to be used.
   * @param expense Expense type, either 'expense' or 'bonus'.
   */
  onAddExpense(formGroupData: FormGroup, expenseData: WritableSignal<Expenses[]>, expense: string): void {
    this.addElement(expense === 'expense', formGroupData.value as ExpensesFormData);
    formGroupData.reset();
    expense === 'expense'
      ? this.expensesValueInputRef.nativeElement.focus()
      : this.bonusValueInputRef.nativeElement.focus();
    this.localStorageService.set(expense, JSON.stringify(expenseData()));
  }

  onSave(expenseType: string, collectionSignal: WritableSignal<Expenses[]>) {
    const idFirestoreCollection = this.localStorageService.get(`id_${expenseType}`);
    if (!idFirestoreCollection) {
      this.expensesService
        .addExpense(collectionSignal(), expenseType)
        .subscribe((id) => alert(`${expenseType} added with id ${id}`));
    } else {
      this.expensesService.updateExpenseData(idFirestoreCollection, collectionSignal());
      expenseType === 'expense'
        ? this.localStorageService.set('expense', JSON.stringify(collectionSignal()))
        : this.localStorageService.set('bonus', JSON.stringify(collectionSignal()));
    }
    expenseType === 'expense' ? (this.expenseChanged = false) : (this.bonusChanged = false);
    expenseType === 'expense'
      ? this.localStorageService.delete('expenseChanged')
      : this.localStorageService.delete('bonusChanged');
  }
}
