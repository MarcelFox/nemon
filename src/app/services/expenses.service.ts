import { Injectable, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Expenses } from '../content/expenses/expenses.component';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  firestore = inject(Firestore);
  expansesCollection = collection(this.firestore, 'expenses');

  public getExpenses(): Observable<Expenses[]> {
    return collectionData(this.expansesCollection, {
      idField: 'id',
    }) as Observable<Expenses[]>;
  }

  public addExpense(data: Expenses): Observable<string> {
    return from(addDoc(this.expansesCollection, data).then((reponse) => reponse.id));
  }

  public deleteExpense(expenseId: string): Observable<void> {
    return from(deleteDoc(this.getDocRef(expenseId)));
  }

  public updateExpense(expenseId: string, expenseData: Expenses): Observable<void> {
    return from(setDoc(this.getDocRef(expenseId), expenseData));
  }

  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
