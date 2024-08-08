import { Component, OnInit } from '@angular/core';
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
      provide: 'firestore',
      useFactory: () => new FirestoreService<ExpensesCollection>('expenses'),
    },
  ],
})
export class ExpenseListComponent implements OnInit {
  constructor(private firestore: FirestoreService<ExpensesCollection>) {}
  ngOnInit(): void {
    console.log(this.firestore.getAll());
  }
}
