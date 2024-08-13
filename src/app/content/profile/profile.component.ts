import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { IncomesComponent } from './incomes/incomes.component';
import { ExpenseListComponent } from "../../../shared/components/expense-list/expense-list.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatTabsModule, IncomesComponent, ExpenseListComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {}
