import { Observable } from 'rxjs';

export abstract class Repository<Type> {
  /**
   * Returns all documents from collection.
   * @returns Observable<Type[]> containing all documents.
   */
  public abstract getAll(): Observable<Type[]>;

  /**
   * Get documents that have the same key and value as informed.
   * @param key Key name from the object.
   * @param value Value of the key.
   * @returns Observable<Type[]> of document found.
   */
  public abstract getByKeyValue(key: string, value: unknown): Observable<Type[]>;

  /**
   * Get a document by it's ID.
   * @param docId Document id.
   * @returns Observable<Type> containing the data found.
   */
  public abstract getById(docId: string): Observable<Type[]>;

  /**
   * Create a new document into the firestore collection.
   * @param data Document data to be created.
   * @returns Observable<string> ID from created doc
   */
  public abstract create(data: Type): Observable<string>;

  /**
   * Updates the document data by it's id.
   * @param docId ID from document to be updated.
   * @param data Data to be updated.
   */
  public abstract update(docId: string, data: Type[]): void;

  /**
   * Deletes a document by it's ID.
   * @param docId Document ID
   * @returns Observable<void>
   */
  public abstract delete(docId: string): Observable<void>;
}
