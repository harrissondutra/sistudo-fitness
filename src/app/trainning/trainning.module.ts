import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { TrainningComponent } from './trainning/trainning.component';
import { TrainningCreateComponent } from './trainning-create/trainning-create.component';

const routes: Routes = [
  { path: '', component: TrainningComponent },
  { path: 'create', component: TrainningCreateComponent }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    TrainningComponent,
    TrainningCreateComponent
  ]
})
export class TrainningModule { } 