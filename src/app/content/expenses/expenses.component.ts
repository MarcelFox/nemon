import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, WritableSignal, computed, signal, ElementRef, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface Expenses {
  id: number;
  name: string;
  value: number;
}

export interface ExpensesFormData {
  name: string;
  value: number;
}

const EXPENSES_DATA: Expenses[] = [];
const BONUS_DATA: Expenses[] = [];

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
  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal(EXPENSES_DATA);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal(BONUS_DATA);
  @Input({ required: true }) idBonus: WritableSignal<number> = signal(0);
  @Input({ required: true }) idExpenses: WritableSignal<number> = signal(0);
  @Input({ required: true }) newExpenseData: WritableSignal<Expenses | {}> = signal({});

  @ViewChild('expenseValueInputRef') expensesValueInputRef!: ElementRef;
  @ViewChild('bonusValueInputRef') bonusValueInputRef!: ElementRef;

  displayedColumns: string[] = ['name', 'value'];
  displayedColumns2: string[] = ['total', 'value'];

  expensesForm = new FormGroup({
    name: new FormControl(''),
    value: new FormControl(0),
  });
  bonusForm = new FormGroup({
    name: new FormControl(''),
    value: new FormControl(0),
  });

  public totalExpenses = computed(() =>
    this.expensesData().reduce((acc: number, cur: Expenses): number => {
      return acc + cur.value;
    }, 0)
  );
  public totalBonus = computed(() =>
    this.bonusData().reduce((acc: number, cur: Expenses): number => {
      return acc + cur.value;
    }, 0)
  );

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
  }

  private deleteElementById(id: number, listElements: Expenses[]) {
    const elementId = listElements.findIndex((e: Expenses) => e.id === id);
    listElements.splice(elementId, 1);
    return [...listElements];
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
  }
  onSubmitBonus() {
    this.addElement(false, this.bonusForm.value as ExpensesFormData);
    this.bonusForm.reset();
    this.bonusValueInputRef.nativeElement.focus();
  }
}
