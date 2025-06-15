import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { LogoutComponent } from './logout/logout.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { TrainningCreateComponent } from '../app/trainning/trainning-create/trainning-create.component'; // Importe o componente de criação de treino
import { TrainningComponent } from './trainning/trainning/trainning.component';
import { UserComponent } from './user/user.component';
import { ListExerciseComponent } from './Exercises/list-exercise/list-exercise.component';
// import { TrainningEditComponent } from './trainning-edit/trainning-edit.component'; // **Assumindo que você terá um componente de edição de treino**
import { CreateExerciseComponent } from './Exercises/create-exercise/create-exercise.component';
import { CategoryExerciseComponent } from './Exercises/category-exercise/category-exercise.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'register', component: UserRegistrationComponent },
      { path: 'user/:id', component: UserComponent },
      { path: 'users-list', component: UserListComponent },
      { path: 'users-edit/:id', component: UserEditComponent },
      { path: 'trainning-create', component: TrainningCreateComponent },
      { path: 'exercises', component: ListExerciseComponent},
      { path: 'create-exercise', component: CreateExerciseComponent},
      { path: 'category-exercise', component: CategoryExerciseComponent},

      {
        path: 'trainning',
        loadChildren: () => import('./trainning/trainning.module').then(m => m.TrainningModule)
      }
      // { path: 'trainings-edit/:id', component: TrainningEditComponent }, // **Nova rota para editar treino (descomente quando tiver o componente)**
      // { path: 'users-search', component: UserSearchComponent },
      // { path: 'users-delete', component: UserDeleteComponent },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];
