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
import { Expenses, ExpensesCollection } from '../interfaces/Expenses.interface';
import { logAtExecution } from '../../../../shared/utils';

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

  public getAllExpenses(): Observable<ExpensesCollection[]> {
    return this.expenses$;
  }

  public getExpensesByType(expenseType: string): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e: ExpensesCollection) => e.type === expenseType)));
  }
  public getExpensesById(expenseId: string): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e) => e.id === expenseId)));
  }

  public getExpensesByMonth(month: number): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e) => e.createdAt.toDate().getMonth() === month)));
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
    // TODO: Consider  transaction instead of first() pipe operator.
    this.getExpensesById(expenseId)
      .pipe(first())
      .subscribe((doc) => {
        doc.filter((e) => from(updateDoc(this.getDocRef(expenseId), { ...e, data })));
      });
  }

  @logAtExecution
  public getExpensesDates(): Observable<{ id: number; date: Date }[]> {
    return this.getAllExpenses().pipe(
      map((docs) => {
        let id = 0;
        return docs.reduce((acc: ExpensesCollection[], cur: ExpensesCollection) => {
          if (acc.length > 0) {
            id += 1;
            if (acc.at(-1)!.createdAt.toDate().getMonth() < cur.createdAt.toDate().getMonth()) {
              acc.push(cur);
            }
          } else {
            acc.push(cur)
          }
          return acc;
        }, []);
      }),
      map((dates) => dates.map((e, id) => ({ id, date: e.createdAt.toDate() }))),
    );
  }

  public findDateByMonth(month: string = ''): Observable<{ id: number; date: Date }[]> {
    month = month || new Date().toLocaleDateString('pt-BR', { month: 'short' });
    return this.getExpensesDates().pipe(
      map((dates) => dates.filter((e) => e.date.toLocaleDateString('pt-BR', { month: 'short' }) === month))
    );
  }

  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
