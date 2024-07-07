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
  getFirestore,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, from, map, first } from 'rxjs';
import { Expenses, ExpensesCollection } from '../content/expenses/expenses.component';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  firestore = inject(Firestore);
  expansesCollection = collection(this.firestore, 'expenses');

  public getAllExpenses(): Observable<ExpensesCollection[]> {
    return collectionData(this.expansesCollection, {
      idField: 'id',
    }) as Observable<ExpensesCollection[]>;
  }
  public getExpensesByType(expenseType: string): Observable<ExpensesCollection[]> {
    console.log(`Calling firestore to ${expenseType}`);
    const data$ = collectionData(this.expansesCollection, {
      idField: 'id',
    }) as Observable<ExpensesCollection[]>;
    return data$.pipe(map((doc) => doc.filter((e: ExpensesCollection) => e.type === expenseType)));
  }
  public getExpensesById(expenseId: string): Observable<ExpensesCollection[]> {
    return docData(this.getDocRef(expenseId));
  }

  public addExpense(data: Expenses[], expenseType: string): Observable<string> {
    return from(
      addDoc(this.expansesCollection, { createdAt: new Date(), data, type: expenseType }).then((reponse) => reponse.id)
    );
  }

  public deleteExpense(expenseId: string): Observable<void> {
    return from(deleteDoc(this.getDocRef(expenseId)));
  }

  public updateExpenseData(expenseId: string, data: Expenses[]): void {
    this.getExpensesById(expenseId).subscribe((doc) =>
      from(setDoc(this.getDocRef(expenseId), { ...doc, data })
    ));
  }

  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
