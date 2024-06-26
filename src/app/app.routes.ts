import { Routes } from '@angular/router';
import { MainComponent } from './content/main/main.component';
import { ExpensesComponent } from './content/expenses/expenses.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'expenses', component: ExpensesComponent },
];
