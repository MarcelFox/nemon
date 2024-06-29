import { CommonModule, JsonPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface Expenses {
  id: number;
  name: string;
  value: number;
}

const EXPENSES_DATA: Expenses[] = [
  { id: 1, name: 'gasto 1', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
  { id: 2, name: 'gasto 2', value: 10.0 },
];

const EXPENSES_DATA_2: Expenses[] = [{ id: 1, name: 'gasto 1', value: 10.0 }];

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, JsonPipe, MatTableModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  expensesData = input<Expenses[]>(EXPENSES_DATA);
  bonusData = input<Expenses[]>(EXPENSES_DATA_2);

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
}
