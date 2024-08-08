import { Inject, Injectable, inject } from '@angular/core';
import {
  DocumentReference,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
  Firestore,
} from '@angular/fire/firestore';
import { Observable, first, from, map } from 'rxjs';
import { Repository } from '../abstract/repository.abstract';

/**
 * FirestoreService Class.
 * @param collectionName Name of the collection.
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreService<Type> implements Repository<Type> {
  constructor(@Inject('collectionName') private collectionName: string) {}

  private firestore = inject(Firestore);
  private collectionRef = collection(this.firestore, this.collectionName);
  public collection$: Observable<Type[]> = collectionData(this.collectionRef, { idField: 'id' });

  public getAll(): Observable<Type[]> {
    return this.collection$;
  }

  public getByKeyValue(key: string, value: unknown): Observable<Type[]> {
    return this.collection$.pipe(map((doc) => doc.filter((e) => (e as Record<string, unknown>)[key] === value)));
  }

  public getById(docId: string): Observable<Type[]> {
    return this.getByKeyValue('id', docId);
  }

  public create(data: Type): Observable<string> {
    return from(addDoc(this.collectionRef, { ...data, createdAt: new Date() }).then((reponse) => reponse.id));
  }

  public update(docId: string, data: Type[]): void {
    // TODO: Consider  transaction instead of first() pipe operator.
    this.getById(docId)
      .pipe(first())
      .subscribe((doc) => {
        doc.filter((e) => from(updateDoc(this.getDocRef(docId), { ...e, data })));
      });
  }

  public delete(docId: string): Observable<void> {
    return from(deleteDoc(this.getDocRef(docId)));
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
