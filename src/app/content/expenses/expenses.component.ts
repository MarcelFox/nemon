import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, WritableSignal, computed, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';

export interface Expenses {
  id: number;
  name: string;
  value: number;
}

const EXPENSES_DATA: Expenses[] = [];
const BONUS_DATA: Expenses[] = [];

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, JsonPipe, MatTableModule, MatSortModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal(EXPENSES_DATA);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal(BONUS_DATA);
  @Input({ required: true }) idBonus: WritableSignal<number> = signal(0);
  @Input({ required: true }) idExpenses: WritableSignal<number> = signal(0);

  displayedColumns: string[] = ['name', 'value'];
  displayedColumns2: string[] = ['total', 'value'];

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

  public addElement(expenses: boolean = true) {
    expenses ? this.idExpenses.update((num) => num + 1) : this.idBonus.update((num) => num + 1);
    expenses
      ? this.expensesData.update(() => [
          ...this.expensesData(),
          { id: this.idExpenses(), name: 'gasto', value: Math.random() * (9999 - 1) + 1 },
        ])
      : this.bonusData.update(() => [
          ...this.bonusData(),
          { id: this.idBonus(), name: 'bonus', value: Math.random() * (9999 - 1) + 1 },
        ]);
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
}
