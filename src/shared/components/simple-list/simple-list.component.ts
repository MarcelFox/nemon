import { Component, Inject, Input, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { Timestamp } from '@angular/fire/firestore';
import { first, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

interface SimpleListInterface {
  id: string;
  createdAt: Timestamp;
  data: { id: number; detail: string; value: number | null }[];
}

@Component({
  selector: 'app-simple-list',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  providers: [
    {
      provide: 'fireStoreService',
      useClass: FirestoreService<SimpleListInterface>,
    },
  ],
  templateUrl: './simple-list.component.html',
  styleUrl: './simple-list.component.css',
})
export class SimpleListComponent {
  constructor(
    @Inject('fireStoreService')
    private fireStoreService: FirestoreService<SimpleListInterface>
  ) {}

  @Input({required: true})  title: string = '';
  displayedColumns: string[] = ['detail', 'value', 'id'];
  dataSource: WritableSignal<{ id: number; detail: string; value: number | null }[]> = signal([]);
  collectionData: WritableSignal<SimpleListInterface[]> = signal([]);

  incomesData: WritableSignal<SimpleListInterface['data']> = signal([]);
  incomeInputName: string = '';
  incomeInputValue: number | null = null;
  disableSaveBtn: boolean = false;
  editionMode: boolean = false;

  dataChanged = computed((): boolean => {
    return this.dataSource().at(-1) !== this.incomesData().at(-1);
  });
  totalSum = computed(() =>
    this.dataSource()
      ? this.dataSource().reduce((acc: number, cur: { id: number; detail: string; value: number | null }): number => {
          if (cur.value) {
            return acc + cur.value;
          } else {
            return acc;
          }
        }, 0)
      : 0
  );

  ngOnInit(): void {
    this.fireStoreService
      .getAll()
      .pipe(first())
      .pipe(
        tap((collection) => {
          this.collectionData.update(() => collection);
          collection.forEach((bonus) => {
            this.incomesData.update(() => bonus.data);
            this.dataSource.update(() => bonus.data);
          });
        })
      )
      .subscribe();
  }

  onAdd() {
    this.disableSaveBtn = false;
    this.dataSource.update(() => [
      ...this.dataSource(),
      {
        id: this.dataSource().length + 1,
        detail: this.incomeInputName,
        value: this.incomeInputValue,
      },
    ]);
  }

  onSave() {
    if (this.collectionData().length > 0) {
      this.fireStoreService.update(this.collectionData()[0].id, { data: this.dataSource() });
    } else {
      this.fireStoreService.create({
        createdAt: Timestamp.now(),
        data: this.dataSource(),
      } as SimpleListInterface);
      this.incomeInputName = '';
      this.incomeInputValue = 0;
    }
    this.incomesData.update(() => this.dataSource());
  }

  onDelete(id: number) {
    this.dataSource.update(() => [...this.dataSource().filter((e) => e.id !== id)]);
  }
}
