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

  /**
   * Get all docs from Expense collection.
   * @returns Observable<ExpensesCollection[]>
   */
  public getAllExpenses(): Observable<ExpensesCollection[]> {
    return this.expenses$;
  }

  /**
   * Get expense docs by it's type.
   * @param expenseType If it's 'expense' or 'bonus'
   * @returns Observable<ExpensesCollection[]>
   */
  public getExpensesByType(expenseType: string): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e: ExpensesCollection) => e.type === expenseType)));
  }

  /**
   * Get expense docs by ID.
   * @param expenseId ID from expense.
   * @returns Observable<ExpensesCollection[]>
   */
  public getExpensesById(expenseId: string): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e) => e.id === expenseId)));
  }

  /**
   * Get all available expenses docs by month.
   * @param month Month number
   * @returns Observable<ExpensesCollection[]>
   */
  public getExpensesByMonth(month: number): Observable<ExpensesCollection[]> {
    return this.expenses$.pipe(map((doc) => doc.filter((e) => e.createdAt.toDate().getMonth() === month)));
  }

  /**
   * Add a new expense into collection.
   * @param data Data to be added into collection
   * @param expenseType If it's 'expense' or 'bonus'
   * @returns Observable<string>
   */
  public addExpense(data: Expenses[], expenseType: string): Observable<string> {
    return from(
      addDoc(this.expansesCollection, { createdAt: new Date(), data, type: expenseType }).then((reponse) => reponse.id)
    );
  }

  /**
   * Delete an expense doc by ID from collection.
   * @param expenseId ID from expense.
   * @returns Void
   */
  public deleteExpense(expenseId: string): Observable<void> {
    return from(deleteDoc(this.getDocRef(expenseId)));
  }

  /**
   * Updates the Expense data.
   * @param expenseId ID from expense.
   * @param data Data to be updated.
   */
  public updateExpenseData(expenseId: string, data: Expenses[]): void {
    // TODO: Consider  transaction instead of first() pipe operator.
    this.getExpensesById(expenseId)
      .pipe(first())
      .subscribe((doc) => {
        doc.filter((e) => from(updateDoc(this.getDocRef(expenseId), { ...e, data })));
      });
  }

  /**
   * Returns an Observable containing all avaliable dates from docs.
   * @returns Observable<{ id: number; date: Date }[]>
   */
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
            acc.push(cur);
          }
          return acc;
        }, []);
      }),
      map((dates) => dates.map((e, id) => ({ id, date: e.createdAt.toDate() })))
    );
  }

  /**
   * Find date by it's local Data as short month string.
   * @param month Local short month as string from Date object.
   * @returns Observable<{ id: number; date: Date }[]>
   */
  public findDateByMonth(month: string = ''): Observable<{ id: number; date: Date }[]> {
    month = month || new Date().toLocaleDateString('pt-BR', { month: 'short' });
    return this.getExpensesDates().pipe(
      map((dates) => dates.filter((e) => e.date.toLocaleDateString('pt-BR', { month: 'short' }) === month))
    );
  }

  /**
   * Get the DocumentRef from the document by it's ID.
   * @param id ID from the collection
   * @returns DocumentReference
   */
  private getDocRef(id: string): DocumentReference {
    return doc(this.firestore, `expenses/${id}`);
  }
}
