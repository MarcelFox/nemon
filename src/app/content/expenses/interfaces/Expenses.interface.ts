import { Timestamp } from '@angular/fire/firestore';

export interface Expenses {
  id: number;
  detail: string;
  value: number;
}

export interface ExpensesFormData {
  detail: string;
  value: number;
}

export interface ExpensesCollection {
  createdAt: Timestamp;
  data: Expenses[];
  id: string;
  type: string;
}
