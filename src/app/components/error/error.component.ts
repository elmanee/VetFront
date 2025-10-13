import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [
    CommonModule,
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent implements OnInit, OnDestroy {

  countdown: number = 5;
  private timerSubscription: any;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
    }
  }

  startCountdown(): void {
    this.timerSubscription = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(this.timerSubscription);
        this.redirectToHome();
      }
    }, 1000);
  }

  redirectToHome(): void {
    this.router.navigate(['/']);
  }
}
