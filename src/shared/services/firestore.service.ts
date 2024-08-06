import { inject } from '@angular/core';
import {
  DocumentReference,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Firestore } from '@firebase/firestore';
import { Observable, first, from, map } from 'rxjs';

/**
 * FirestoreService Class.
 * @param collectionName Name of the collection.
 */
export class FirestoreService<Type> {
  constructor(private collectionName: string) {
    this.collectionName = collectionName;
  }

  private firestore = inject(Firestore);
  private collectionRef = collection(this.firestore, this.collectionName);
  public collection$: Observable<Type[]> = collectionData(this.collectionRef, { idField: 'id' });

  /**
   * Returns all documents from collection.
   * @returns Observable<Type[]> containing all documents.
   */
  public getAll(): Observable<Type[]> {
    return this.collection$;
  }

  /**
   * Get documents that have the same key and value as informed.
   * @param key Key name from the object.
   * @param value Value of the key.
   * @returns Observable<Type[]> of document found.
   */
  public getByKeyValue(key: string, value: unknown): Observable<Type[]> {
    return this.collection$.pipe(map((doc) => doc.filter((e) => (e as Record<string, unknown>)[key] === value)));
  }

  /**
   * Get a document by it's ID.
   * @param docId Document id.
   * @returns Observable<Type> containing the data found.
   */
  public getById(docId: string): Observable<Type[]> {
    return this.getByKeyValue('id', docId);
  }

  /**
   * Create a new document into the firestore collection.
   * @param data Document data to be created.
   * @returns Observable<string> ID from created doc
   */
  public create(data: Type): Observable<string> {
    return from(addDoc(this.collectionRef, { ...data, createdAt: new Date() }).then((reponse) => reponse.id));
  }

  /**
   * Updates the document data by it's id.
   * @param docId ID from document to be updated.
   * @param data Data to be updated.
   */
  public update(docId: string, data: Type[]): void {
    // TODO: Consider  transaction instead of first() pipe operator.
    this.getById(docId)
      .pipe(first())
      .subscribe((doc) => {
        doc.filter((e) => from(updateDoc(this.getDocRef(docId), { ...e, data })));
      });
  }

  /**
   * Deletes a document by it's ID.
   * @param docId Document ID
   * @returns Observable<void>
   */
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
