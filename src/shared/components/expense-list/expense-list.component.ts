import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Expenses, ExpensesCollection } from '../../../app/content/expenses/interfaces/Expenses.interface';
import { first, tap } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
  providers: [
    {
      provide: 'expensesService',
      useClass: FirestoreService<ExpensesCollection>,
    },
  ],
})
export class ExpenseListComponent implements OnInit {
  constructor(
    @Inject('expensesService') private expensesService: FirestoreService<ExpensesCollection>,
    @Inject('expenseListTitle') public title: string
  ) {}

  // TODO: Remove type from ExpensesCollection to rely only on collection itself.
  ngOnInit(): void {
    this.expensesService
      .getAll()
      .pipe(first())
      .pipe(
        tap((collection) => {
          this.handleMonthsTab(collection);
          collection = collection.filter((doc) => doc.createdAt.toDate().getMonth() === this.expenseDate.getMonth());
          this.collectionData.update(() => collection);
          const docs = collection.flatMap((e) => e.data);
          this.data.update(() => docs);
          this.lastId.update(() => docs.length);
        })
      )
      .subscribe();
  }

  @Input({ required: false }) expenseDate: Date = new Date();
  @Input({ required: false }) hideMonthsTab: boolean = true;
  @ViewChild('expenseValueInputRef') expensesValueInputRef!: ElementRef;

  data: WritableSignal<Expenses[]> = signal([]);
  lastId: WritableSignal<number> = signal(0);
  collectionData: WritableSignal<ExpensesCollection[]> = signal([]);
  months: WritableSignal<{ id: number; date: Date }[]> = signal([]);
  activeMonthId: WritableSignal<number> = signal(0);
  collectionId: string = '';
  formChanged: boolean = false;

  expensesForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });

  public totalSum = computed(() =>
    this.data()
      ? this.data().reduce((acc: number, cur: Expenses): number => {
          return acc + cur.value;
        }, 0)
      : 0
  );

  handleMonthsTab(collection: ExpensesCollection[]) {
    this.months.update(() =>
      collection.map((e, id) => {
        return { date: e.createdAt.toDate(), id };
      })
    );
    const foundActualMonth = this.months().filter((month) => month.date.getMonth() === this.expenseDate.getMonth());
    if (foundActualMonth.length < 1) {
      this.months.update(() => [...this.months(), { id: this.months().length, date: this.expenseDate }]);
    }
    this.activeMonthId.update(() => this.months().length - 1);
  }

  /**
   * Sorts the objects into the Material table.
   * @param sort Sort from material, used to get direction.
   * @param objectsList The objects to be sorted.
   */
  sortData(sort: Sort, objectsList: Expenses[]) {
    objectsList.sort((a, b) => (sort.direction === 'asc' ? a.value - b.value : b.value - a.value));
  }

  removeExpense(elementId: number): void {
    this.data().filter((e) => e.id === elementId);
    const newList = this.data().filter((e: Expenses) => e.id !== elementId);
    newList.forEach((e) => {
      if (e.id >= elementId) {
        e.id = e.id - 1;
      }
    });
    this.data.update(() => newList);
    this.formChanged = true;
  }

  addExpense() {
    this.lastId.update(() => this.lastId() + 1);
    this.data.update(() => [...this.data(), { ...(this.expensesForm.value as Expenses), id: this.lastId() }]);
    this.formChanged = true;
    this.expensesForm.reset();
    this.expensesValueInputRef.nativeElement.focus();
  }

  saveExpense() {
    if (this.collectionData().length > 0) {
      this.expensesService.update(this.collectionData()[0].id, { data: this.data() });
    } else {
      this.expensesService.create({
        createdAt: Timestamp.now(),
        data: this.data(),
        type: 'expenses',
      } as ExpensesCollection);
    }
    this.formChanged = false;
  }

  public onMonthClick(e: { id: number; date: Date }) {
    this.activeMonthId.update(() => e.id);
    this.expensesService
      .getAll()
      .pipe(first())
      .pipe(
        tap((collection) => {
          collection = collection.filter((doc) => doc.createdAt.toDate().getMonth() === e.date.getMonth());
          this.collectionData.update(() => collection);
          const docs = collection.flatMap((e) => e.data);
          this.data.update(() => docs);
          this.lastId.update(() => docs.length);
        })
      )
      .subscribe();
  }
}
