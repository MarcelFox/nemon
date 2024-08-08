import { Component, Inject, OnInit, inject } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { ExpensesCollection } from '../../../app/content/expenses/interfaces/Expenses.interface';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
  providers: [
    {
      provide: 'expensesService',
      useClass: FirestoreService<ExpensesCollection>,
    },
    {
      provide: 'collectionName',
      useValue: 'expenses',
    },
  ],
})
export class ExpenseListComponent implements OnInit {
  constructor(@Inject('expensesService') private expensesService: FirestoreService<ExpensesCollection>) {}
  ngOnInit(): void {
    console.log(this.expensesService.collection$);
  }
}
