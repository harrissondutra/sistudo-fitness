import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { LogoutComponent } from './logout/logout.component';
import { ClientRegistrationComponent } from './client/client-registration/client-registration.component';
import { ClientListComponent } from './client/client-list/client-list.component';
import { ClientEditComponent } from './client/client-edit/client-edit.component';
import { TrainningCreateComponent } from '../app/trainning/trainning-create/trainning-create.component'; // Importe o componente de criação de treino
import { TrainningComponent } from './trainning/trainning/trainning.component';
import { ClientComponent } from './client/client.component';
import { ListExerciseComponent } from './Exercises/list-exercise/list-exercise.component';
// import { TrainningEditComponent } from './trainning-edit/trainning-edit.component'; // **Assumindo que você terá um componente de edição de treino**
import { CreateExerciseComponent } from './Exercises/create-exercise/create-exercise.component';
import { CategoryExerciseComponent } from './Exercises/category-exercise/category-exercise.component';
import { InactiveTrainningComponent } from './trainning/inactive-trainning/inactive-trainning.component';
import { TrainningViewComponent } from './trainning/trainning-view/trainning-view/trainning-view.component';
import { TrainningEditComponent } from './trainning/trainning-edit/trainning-edit/trainning-edit.component';
import { TrainningCategoryComponent } from './trainning/trainning-category/trainning-category.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'register', component: ClientRegistrationComponent },
      { path: 'client/:id', component: ClientComponent },
      { path: 'clients-list', component: ClientListComponent },
      { path: 'clients-edit/:id', component: ClientEditComponent },
      { path: 'trainning-create', component: TrainningCreateComponent },
      { path: 'trainning-view/:id', component: TrainningViewComponent },
      { path: 'trainning-edit/:id', component: TrainningEditComponent },
      { path: 'exercises', component: ListExerciseComponent},
      { path: 'exercises', component: ListExerciseComponent},
      { path: 'create-exercise', component: CreateExerciseComponent},
      { path: 'create-category-trainning', component: TrainningCategoryComponent},
      { path: 'category-exercise', component: CategoryExerciseComponent},
      { path: 'inactive-trainning', component: InactiveTrainningComponent }, // **Assumindo que você terá um componente para treinos inativos**

      {
        path: 'trainning',
        loadChildren: () => import('./trainning/trainning.module').then(m => m.TrainningModule)
      }
      // { path: 'trainings-edit/:id', component: TrainningEditComponent }, // **Nova rota para editar treino (descomente quando tiver o componente)**
      // { path: 'clients-search', component: ClientSearchComponent },
      // { path: 'clients-delete', component: ClientDeleteComponent },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];
