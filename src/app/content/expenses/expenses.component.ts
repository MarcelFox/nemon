import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, WritableSignal, computed, signal, ElementRef, ViewChild, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpensesService } from './services/expenses.service';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { first, tap } from 'rxjs';
import {
  ExpenseTypeEnum,
  ExpenseIDEnum,
  CollectionIDEnum,
  ExpenseChangedEnum,
} from './enums/expenseType.enum';
import { Expenses, ExpensesFormData } from './interfaces/Expenses.interface';

@Component({
  selector: 'app-expenses',
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
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  expensesService = inject(ExpensesService);
  localStorageService = inject(LocalStorageService);

  @Input({ required: true }) months: WritableSignal<{ id: number; date: Date }[]> = signal([]);
  @Input({ required: true }) expensesData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) bonusData: WritableSignal<Expenses[]> = signal([]);
  @Input({ required: true }) idBonus: WritableSignal<number> = signal(0);
  @Input({ required: true }) idExpenses: WritableSignal<number> = signal(0);
  @Input({ required: true }) activeMonthId: WritableSignal<number> = signal(0);

  @ViewChild('expenseValueInputRef') expensesValueInputRef!: ElementRef;
  @ViewChild('bonusValueInputRef') bonusValueInputRef!: ElementRef;

  displayedColumns: string[] = ['detail', 'value'];
  displayedColumns2: string[] = ['total', 'value'];
  expenseChanged: boolean = false;
  bonusChanged: boolean = false;
  expenseLen: number = 0;
  bonusLen: number = 0;

  expensesForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });
  bonusForm = new FormGroup({
    detail: new FormControl(''),
    value: new FormControl(0),
  });

  ngOnInit() {
    this.initExpenseData();
    this.bonusChanged = !!this.localStorageService.get(ExpenseChangedEnum.bonus);
    this.expenseChanged = !!this.localStorageService.get(ExpenseChangedEnum.expense);
    this.idBonus.update(() => Number(this.localStorageService.get(ExpenseIDEnum.bonus)));
    this.idExpenses.update(() => Number(this.localStorageService.get(ExpenseIDEnum.expense)));
  }

  public onMonthClick(e: { id: number; date: Date }) {
    this.activeMonthId.update(() => e.id);
    this.handleLocalData(e.date.getMonth());
    this.bonusChanged = false;
    this.expenseChanged = false;
  }

  public totalExpenses = computed(() =>
    this.expensesData()
      ? this.expensesData().reduce((acc: number, cur: Expenses): number => {
          return acc + cur.value;
        }, 0)
      : 0
  );
  public totalBonus = computed(() =>
    this.bonusData()
      ? this.bonusData().reduce((acc: number, cur: Expenses): number => {
          return acc + cur.value;
        }, 0)
      : 0
  );

  /**
   * Initialize expenses data looking for the local storage first and then from firestore.
   * @param localStorageData Data stored at local storage
   * @param collectionSignal Signal type of the firestore collection
   * @param expenseType Type of the expense
   */
  private initExpenseData(): void {
    // Initialize new month data:
    this.expensesService
      .findDateByMonth()
      .pipe(first())
      .subscribe((date) => {
        if (date.length < 1) {
          this.expensesService.addExpense([], ExpenseTypeEnum.expense);
          this.expensesService.addExpense([], ExpenseTypeEnum.bonus);
        }
      });
    // Update months tabs:
    this.expensesService.getExpensesDates().subscribe((e) => {
      this.months.update(() => e);
    });
    this.expensesService.findDateByMonth().subscribe((e) => {
      this.activeMonthId.update(() => e[0].id);
    });
    if (this.localStorageService.get(ExpenseTypeEnum.expense) || this.localStorageService.get(ExpenseTypeEnum.bonus)) {
      this.expensesData.update(() => JSON.parse(this.localStorageService.get(ExpenseTypeEnum.expense) as string));
      this.bonusData.update(() => JSON.parse(this.localStorageService.get(ExpenseTypeEnum.bonus) as string));
      this.idExpenses.update(() => this.bonusData().length);
      this.idBonus.update(() => this.expensesData().length);
    } else {
      this.handleLocalData();
    }
  }

  /**
   * Handle data to be saved at local storage.
   * @param month number of month, DEFAULT: Actual month number.
   */
  public handleLocalData(month: number = new Date().getMonth()): void {
    this.expensesService
      .getExpensesByMonth(month)
      .pipe(
        tap((docs) =>
          docs.filter((e) => {
            if (e.type === ExpenseTypeEnum.expense) {
              this.expensesData.update(() => e.data);
              this.idExpenses.update(() => e.data.length);
              this.localStorageService.set(ExpenseIDEnum.expense, `${this.idExpenses()}`);
              this.localStorageService.set(ExpenseTypeEnum.expense, JSON.stringify(this.expensesData()));
              this.localStorageService.set(CollectionIDEnum.expense, e.id);
            }
            if (e.type === ExpenseTypeEnum.bonus) {
              this.bonusData.update(() => e.data);
              this.idBonus.update(() => e.data.length);
              this.localStorageService.set(ExpenseIDEnum.bonus, `${this.idBonus()}`);
              this.localStorageService.set(ExpenseTypeEnum.bonus, JSON.stringify(this.bonusData()));
              this.localStorageService.set(CollectionIDEnum.bonus, e.id);
            }
          })
        )
      )
      .subscribe();
  }

  /**
   * Add a new Expense into Expenses list.
   * @param expenses true if is type expense, false if not.
   * @param expenseData Data to be added into the Expenses list.
   */
  public addElement(expenses: boolean, expenseData: ExpensesFormData) {
    if (expenses) {
      this.idExpenses.update((num) => num + 1);
      this.expensesData.update(() => [...this.expensesData(), { ...expenseData, id: this.idExpenses() }]);
      this.expenseChanged = true;
      this.localStorageService.set(ExpenseChangedEnum.expense, '1');
      this.localStorageService.set(ExpenseIDEnum.expense, `${this.idExpenses()}`);
    } else {
      this.idBonus.update((num) => num + 1);
      this.bonusData.update(() => [...this.bonusData(), { ...expenseData, id: this.idBonus() }]);
      this.bonusChanged = true;
      this.localStorageService.set(ExpenseChangedEnum.bonus, '1');
      this.localStorageService.set(ExpenseIDEnum.bonus, `${this.idBonus()}`);
    }
  }

  /**
   * Remove the element be it's ID and handle local storage disposition.
   * @param id id of the Element to be removed
   * @param expense true if is type expense, false if not.
   */
  public removeElement(id: number, expense: boolean = true) {
    if (expense) {
      this.expensesData.update(() => {
        return this.deleteElementById(id, this.expensesData(), expense);
      });
      this.localStorageService.set(ExpenseTypeEnum.expense, JSON.stringify(this.expensesData()));
      this.expenseChanged = true;
      this.localStorageService.set(ExpenseChangedEnum.expense, '1');
      this.localStorageService.set(ExpenseIDEnum.expense, `${this.idExpenses()}`);
    } else {
      this.bonusData.update(() => {
        return this.deleteElementById(id, this.bonusData(), expense);
      });
      this.localStorageService.set(ExpenseTypeEnum.bonus, JSON.stringify(this.bonusData()));
      this.bonusChanged = true;
      this.localStorageService.set(ExpenseChangedEnum.bonus, '1');
      this.localStorageService.set(ExpenseIDEnum.bonus, `${this.idBonus()}`);
    }
  }

  /**
   * Delete an element by ID from the list of Expeses.
   * @param id ID of the object in the list of elements.
   * @param listElements List of objects.
   * @param expense true if is type expense, false if not.
   * @returns Updated list of Expenses.
   */
  private deleteElementById(id: number, listElements: Expenses[], expense: boolean): Expenses[] {
    const newList = listElements.filter((e: Expenses) => e.id !== id);
    newList.forEach((e) => {
      if (e.id >= id) {
        e.id = e.id - 1;
      }
    });
    expense ? this.idExpenses.update(() => newList.length) : this.idBonus.update(() => newList.length);
    return newList;
  }

  /**
   * Sorts the objects into the Material table.
   * @param sort Sort from material, used to get direction.
   * @param objectsList The objects to be sorted.
   */
  sortData(sort: Sort, objectsList: Expenses[]) {
    objectsList.sort((a, b) => (sort.direction === 'asc' ? a.value - b.value : b.value - a.value));
  }

  /**
   * Add a new expense into the expenses collection 'data' array.
   * @param formGroupData Form group data to be readed.
   * @param expenseData Expense signal to be used.
   * @param expense Expense type, either ExpenseTypeEnum.expense or ExpenseTypeEnum.bonus.
   */
  onAddExpense(formGroupData: FormGroup, expenseData: WritableSignal<Expenses[]>, expense: string): void {
    this.addElement(expense === ExpenseTypeEnum.expense, formGroupData.value as ExpensesFormData);
    formGroupData.reset();
    expense === ExpenseTypeEnum.expense
      ? this.expensesValueInputRef.nativeElement.focus()
      : this.bonusValueInputRef.nativeElement.focus();
    this.localStorageService.set(expense, JSON.stringify(expenseData()));
  }

  /**
   * Save the objects from the table.
   * @param expenseType 'expense' or 'bonus'
   * @param collectionSignal WritableSignal to be used
   */
  onSave(expenseType: string, collectionSignal: WritableSignal<Expenses[]>) {
    const idFirestoreCollection = this.localStorageService.get(`id_${expenseType}`);
    if (!idFirestoreCollection) {
      this.expensesService
        .addExpense(collectionSignal(), expenseType)
        .subscribe((id) => alert(`${expenseType} added with id ${id}`));
    } else {
      this.expensesService.updateExpenseData(idFirestoreCollection, collectionSignal());
      expenseType === ExpenseTypeEnum.expense
        ? this.localStorageService.set(ExpenseTypeEnum.expense, JSON.stringify(collectionSignal()))
        : this.localStorageService.set(ExpenseTypeEnum.bonus, JSON.stringify(collectionSignal()));
    }
    expenseType === ExpenseTypeEnum.expense ? (this.expenseChanged = false) : (this.bonusChanged = false);
    expenseType === ExpenseTypeEnum.expense
      ? this.localStorageService.delete(ExpenseChangedEnum.expense)
      : this.localStorageService.delete(ExpenseChangedEnum.bonus);
  }
}
