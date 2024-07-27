import { Injectable, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, from, map, first, tap } from 'rxjs';
import { Expenses, ExpensesCollection } from '../content/expenses/expenses.component';
import { logAtExecution } from '../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  expenses$: Observable<ExpensesCollection[]>;
  firestore = inject(Firestore);
  expansesCollection = collection(this.firestore, 'expenses');

  constructor() {
    this.expenses$ = collectionData(this.expansesCollection, {
      idField: 'id',
    });
  }

  @logAtExecution
  public getAllExpenses(): Observable<ExpensesCollection[]> {
    return this.expenses$;
  }

  @logAtExecution
  public getExpensesByType(expenseType: string): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e: ExpensesCollection) => e.type === expenseType)));
  }
  @logAtExecution
  public getExpensesById(expenseId: string): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e) => e.id === expenseId)));
  }

  @logAtExecution
  public addExpense(data: Expenses[], expenseType: string): Observable<string> {
    return from(
      addDoc(this.expansesCollection, { createdAt: new Date(), data, type: expenseType }).then((reponse) => reponse.id)
    );
  }

  @logAtExecution
  public deleteExpense(expenseId: string): Observable<void> {
    return from(deleteDoc(this.getDocRef(expenseId)));
  }

  @logAtExecution
  public updateExpenseData(expenseId: string, data: Expenses[]): void {
    // TODO: Consider  transaction instead of first() pipe operator.
    this.getExpensesById(expenseId)
      .pipe(first())
      .subscribe((doc) => {
        doc.filter((e) => from(updateDoc(this.getDocRef(expenseId), { ...e, data })));
      });
  }

  public getExpensesDates(): Observable<{ id: number; date: Date }[]> {
    return this.getAllExpenses().pipe(
      map((docs) => {
        const dates = docs.map((e) => e.createdAt);
        return dates.flatMap((d, id) => {
          return { id, date: d.toDate() };
        });
      })
    );
  }

  @logAtExecution
  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
