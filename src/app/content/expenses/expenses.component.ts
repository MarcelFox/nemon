import { CommonModule, JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface Expenses {
  id: number;
  name: string;
  value: number;
  description: string;
}

const EXPENSES_DATA: Expenses[] = [
  { id: 1, name: 'gasto 1', value: 10.00, description: 'gasto necessário com tal coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
  { id: 2, name: 'gasto 2', value: 10.00, description: 'gasto necessário com outra coisa' },
]

const EXPENSES_DATA_2: Expenses[] = [
  { id: 1, name: 'gasto 1', value: 10.00, description: 'gasto necessário com tal coisa' }
]


@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, JsonPipe, MatTableModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent {
  dataSource = signal(EXPENSES_DATA)
  dataSource2 = signal(EXPENSES_DATA_2)
  displayedColumns: string[] = ['name', 'value', 'description'];
}
