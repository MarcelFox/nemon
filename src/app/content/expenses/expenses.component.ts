import { CommonModule, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, WritableSignal, computed, signal } from '@angular/core';
import { NgControlStatus } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

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
  imports: [CommonModule, JsonPipe, MatTableModule],
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

  totalExpenses = computed(() =>
    this.expensesData().reduce((acc: number, cur: Expenses): number => {
      return acc + cur.value;
    }, 0)
  );
  totalBonus = computed(() =>
    this.bonusData().reduce((acc: number, cur: Expenses): number => {
      return acc + cur.value;
    }, 0)
  );

  addElement(expenses: boolean = true) {
    expenses ? this.idExpenses.update((num) => num + 1) : this.idBonus.update((num) => num + 1);
    expenses
      ? this.expensesData.update(() => [
          ...this.expensesData(),
          { id: this.idExpenses(), name: 'gasto 2', value: Math.random() * (9999 - 1) + 1 },
        ])
      : this.bonusData.update(() => [
          ...this.bonusData(),
          { id: this.idBonus(), name: 'gasto 2', value: Math.random() * (9999 - 1) + 1 },
        ]);
  }
  removeElement(id: number, expenses: boolean = true) {
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
}
