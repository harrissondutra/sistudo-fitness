import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { UserService } from '../services/user/user.service';
import { User } from '../models/user';
import { Trainning } from '../models/trainning';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: User | null = null;
  currentTrainning: Trainning | null = null;
  TrainningHistory: Trainning[] = [];
  TrainningColumns: string[] = ['startDate', 'endDate', 'goal'];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserData(userId);
    }
  }

  private loadUserData(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loadTrainnings();
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    });
  }

  private loadTrainnings(): void {
    if (this.user?.trainings) {
      this.TrainningHistory = this.user.trainings;
      this.currentTrainning = this.user.trainings.find(t => t.active) || null;
    }
  }

  formatMeasure(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return value.toFixed(1);
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onEdit(): void {
    if (this.user?.id) {
      this.router.navigate(['/users-edit', this.user.id]);
    }
  }
}
