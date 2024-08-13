import { Component } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { SimpleListComponent } from '../../../../shared/components/simple-list/simple-list.component';
import { FirestoreService } from '../../../../shared/services/firestore.service';


interface BonusCollectionInterface {
  id: string;
  createdAt: Timestamp;
  data: { id: number; detail: string; value: number | null }[];
}

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [SimpleListComponent],
  providers: [
    {
      provide: 'collectionName',
      useValue: 'bonus',
    },
  ],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css'
})
export class IncomesComponent {

}
