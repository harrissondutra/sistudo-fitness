import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { LogoutComponent } from './logout/logout.component';
import { ClientRegistrationComponent } from './client/client-registration/client-registration.component';
import { ClientListComponent } from './client/client-list/client-list.component';
import { ClientEditComponent } from './client/client-edit/client-edit.component';
import { TrainningCreateComponent } from '../app/trainning/trainning-create/trainning-create.component';
import { TrainningComponent } from './trainning/trainning/trainning.component';
import { ListExerciseComponent } from './Exercises/list-exercise/list-exercise.component';
import { CreateExerciseComponent } from './Exercises/create-exercise/create-exercise.component';
import { CategoryExerciseComponent } from './Exercises/category-exercise/category-exercise.component';
import { InactiveTrainningComponent } from './trainning/inactive-trainning/inactive-trainning.component';
import { TrainningViewComponent } from './trainning/trainning-view/trainning-view/trainning-view.component';
import { TrainningEditComponent } from './trainning/trainning-edit/trainning-edit/trainning-edit.component';
import { TrainningCategoryComponent } from './trainning/trainning-category/trainning-category.component';
import { ClientViewComponent } from './client/client-view/client-view.component';
import { EditMeasuresComponent } from './measures/edit-measures.component';
import { DoctorListComponent } from './doctor/doctor-list/doctor-list/doctor-list.component';
import { DoctorUpdateComponent } from './doctor/doctor-update/doctor-update.component';
import { DoctorCreateComponent } from './doctor/doctor-create/doctor-create.component';
import { NutritionistListComponent } from './nutritionist/nutritionist-list/nutritionist-list.component';
import { NutritionistViewComponent } from './nutritionist/nutritionist-view/nutritionist-view.component';
import { DoctorViewComponent } from './doctor/doctor-view/doctor-view.component';
import { NutritionistUpdateComponent } from './nutritionist/nutritionist-update/nutritionist-update.component';
import { NutritionistCreateComponent } from './nutritionist/nutritionist-create/nutritionist-create.component';
import { PersonalListComponent } from './personal/personal-list/personal-list.component';
import { PersonalViewComponent } from './personal/personal-view/personal-view.component';
import { PersonalUpdateComponent } from './personal/personal-update/personal-update.component';
import { PersonalCreateComponent } from './personal/personal-create/personal-create.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/auth.guard';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserCreateComponent } from './users/user-create/user-create.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'user-list', component: UserListComponent },
      { path: 'user-create', component: UserCreateComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'register', component: ClientRegistrationComponent },
      { path: 'client/:id', component: ClientViewComponent },
      { path: 'clients-list', component: ClientListComponent },
      { path: 'clients-edit/:id', component: ClientEditComponent },
      { path: 'edit-measures/:id', component: EditMeasuresComponent },
      { path: 'trainning-create/:id', component: TrainningCreateComponent },
      { path: 'trainning-view/:id', component: TrainningViewComponent },
      { path: 'trainning-edit/:id', component: TrainningEditComponent },
      { path: 'exercises', component: ListExerciseComponent},
      { path: 'create-exercise', component: CreateExerciseComponent},
      { path: 'create-category-trainning', component: TrainningCategoryComponent},
      { path: 'category-exercise', component: CategoryExerciseComponent},
      { path: 'trainnings', component: TrainningComponent },
      { path: 'inactive-trainning', component: InactiveTrainningComponent },
      { path: 'doctor-list', component: DoctorListComponent },
      { path: 'doctor-view', component: DoctorViewComponent },
      { path: 'doctor-update/:id', component: DoctorUpdateComponent },
      { path: 'doctor-create', component: DoctorCreateComponent },
      { path: 'doctor-create/:id', component: DoctorCreateComponent },
      { path: 'nutritionist-list', component: NutritionistListComponent},
      { path: 'nutritionist-view', component: NutritionistViewComponent },
      { path: 'nutritionist-update/:id', component: NutritionistUpdateComponent },
      { path: 'nutritionist-create', component: NutritionistCreateComponent },
      { path: 'personal-list', component: PersonalListComponent},
      { path: 'personal-view', component: PersonalViewComponent },
      { path: 'personal-update/:id', component: PersonalUpdateComponent },
      { path: 'personal-create', component: PersonalCreateComponent },
      {
        path: 'trainning',
        loadChildren: () => import('./trainning/trainning.module').then(m => m.TrainningModule)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
