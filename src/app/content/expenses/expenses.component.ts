import { Component } from '@angular/core';
import { ExpenseListComponent } from '../../../shared/components/expense-list/expense-list.component';
import { SimpleListComponent } from '../../../shared/components/simple-list/simple-list.component';


@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ExpenseListComponent, SimpleListComponent],
  providers: [
    {
      provide: 'collectionName',
      useValue: 'expenses',
    },
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {}
