import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { LogoutComponent } from './logout/logout.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component'; // Importar o novo componente

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'register', component: UserRegistrationComponent },
      { path: 'users-list', component: UserListComponent },
      { path: 'users-edit/:id', component: UserEditComponent }, // Adicionar esta rota para edição
      // { path: 'users-search', component: UserSearchComponent }, // Se for criar um componente de busca separado
      // { path: 'users-delete', component: UserDeleteComponent }, // Se for criar um componente de delete separado
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];
