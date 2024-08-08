import { Component } from '@angular/core';
import { ExpenseListComponent } from '../../../shared/components/expense-list/expense-list.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ExpenseListComponent],
  providers: [
    {
      provide: 'expenseListTitle',
      useValue: 'Gastos Mensais',
    },
    {
      provide: 'collectionName',
      useValue: 'expenses',
    },
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {}
