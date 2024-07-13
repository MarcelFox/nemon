import { Injectable, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  setDoc,
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
    this.getExpensesById(expenseId)
      .pipe(first())
      .subscribe((doc) => {
        doc.filter((e) => from(updateDoc(this.getDocRef(expenseId), { ...e, data })));
      });
  }

  @logAtExecution
  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
