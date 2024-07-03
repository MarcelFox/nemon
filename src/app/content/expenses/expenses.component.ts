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
  ngOnInit() {
    const bonusFromLocalStorage = localStorage.getItem('bonusData') ?? '';
    const expensesFromLocalStorage = localStorage.getItem('expenseData') ?? '';
    this.bonusData.update(() => JSON.parse(bonusFromLocalStorage));
    this.expensesData.update(() => JSON.parse(expensesFromLocalStorage));
  }
  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal([]);
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
    expenses
      ? localStorage.setItem('expenseData', JSON.stringify(this.expensesData()))
      : localStorage.setItem('bonusData', JSON.stringify(this.bonusData()));
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
    localStorage.setItem('expenseData', JSON.stringify(this.expensesData()));
  }
  onSubmitBonus() {
    this.addElement(false, this.bonusForm.value as ExpensesFormData);
    this.bonusForm.reset();
    this.bonusValueInputRef.nativeElement.focus();
    localStorage.setItem('bonusData', JSON.stringify(this.bonusData()));
  }
}
