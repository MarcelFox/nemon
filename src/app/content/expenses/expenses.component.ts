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

  ngOnInit() {
    this.initExpenseData(localStorage.getItem('bonus'), this.bonusData, 'bonus');
    this.initExpenseData(localStorage.getItem('expense'), this.expensesData, 'expense');
  }

  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) idBonus: WritableSignal<number> = signal(0);
  @Input({ required: true }) idExpenses: WritableSignal<number> = signal(0);

  @ViewChild('expenseValueInputRef') expensesValueInputRef!: ElementRef;
  @ViewChild('bonusValueInputRef') bonusValueInputRef!: ElementRef;

  displayedColumns: string[] = ['detail', 'value'];
  displayedColumns2: string[] = ['total', 'value'];

  expensesForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });
  bonusForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });

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
  ) {
    if (localStorageData) {
      collectionSignal.update(() => JSON.parse(localStorageData));
    } else {
      this.expensesService.getExpensesByType(expenseType).subscribe((doc) =>
        doc.map((e) => {
          collectionSignal.update(() => e.data);
          localStorage.setItem(expenseType, JSON.stringify(collectionSignal()));
          localStorage.setItem(`id_${expenseType}`, e.id);
        })
      );
    }
  }

  public addElement(expenses: boolean, expenseData: ExpensesFormData) {
    expenses ? this.idExpenses.update((num) => num + 1) : this.idBonus.update((num) => num + 1);
    expenses
      ? this.expensesData.update(() => [...this.expensesData(), { ...expenseData, id: this.idExpenses() }])
      : this.bonusData.update(() => [...this.bonusData(), { ...expenseData, id: this.idBonus() }]);
  }

  public removeElement(id: number, expenses: boolean = true) {
    expenses
      ? this.expensesData.update(() => {
          return this.deleteElementById(id, this.expensesData());
        })
      : this.bonusData.update(() => {
          return this.deleteElementById(id, this.bonusData());
        });
    expenses
      ? localStorage.setItem('expense', JSON.stringify(this.expensesData()))
      : localStorage.setItem('bonus', JSON.stringify(this.bonusData()));
  }

  private deleteElementById(id: number, listElements: Expenses[]) {
    return listElements.filter((e: Expenses) => e.id !== id);
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
      localStorage.setItem('bonus', JSON.stringify(collectionSignal()));
    }
  }
}
