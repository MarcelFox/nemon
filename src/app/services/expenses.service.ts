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
} from '@angular/fire/firestore';
import { Observable, from, map, first } from 'rxjs';
import { Expenses, ExpensesCollection } from '../content/expenses/expenses.component';
import { logAtExecution } from '../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  firestore = inject(Firestore);
  expansesCollection = collection(this.firestore, 'expenses');

  @logAtExecution
  public getAllExpenses(): Observable<ExpensesCollection[]> {
    return collectionData(this.expansesCollection, {
      idField: 'id',
    }) as Observable<ExpensesCollection[]>;
  }

  @logAtExecution
  public getExpensesByType(expenseType: string): Observable<ExpensesCollection[]> {
    const data$ = collectionData(this.expansesCollection, {
      idField: 'id',
    }) as Observable<ExpensesCollection[]>;
    return data$.pipe(map((doc) => doc.filter((e: ExpensesCollection) => e.type === expenseType)));
  }
  @logAtExecution
  public getExpensesById(expenseId: string): Observable<ExpensesCollection[]> {
    return docData(this.getDocRef(expenseId));
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
    this.getExpensesById(expenseId).subscribe((doc) => from(setDoc(this.getDocRef(expenseId), { ...doc, data })));
  }

  @logAtExecution
  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
