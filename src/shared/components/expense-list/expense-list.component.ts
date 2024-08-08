import { Component, Inject, OnInit, inject } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { ExpensesCollection } from '../../../app/content/expenses/interfaces/Expenses.interface';
import { first, tap } from 'rxjs';

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
    this.expensesService
      .getByKeyValue('type', 'expense')
      .pipe(tap((e) => console.log(e)))
      .pipe(first())
      .subscribe();
    this.expensesService
      .getByKeyValue('type', 'bonus')
      .pipe(tap((e) => console.log(e)))
      .pipe(first())
      .subscribe();
  }
}
