import { Exercise } from './exercise';
import { User } from './user';

export interface Trainning {
  id?: number;
  name: string;
  exercises: Exercise[];
  user: User;
  active: boolean;
}
