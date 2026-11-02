
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        this.loading = false;

        const role = (
          response.role ||
          localStorage.getItem('role') ||
          ''
        ).toLowerCase();

        if (role === 'driver') {
          this.router.navigate(['/driver-dashboard']);
        } else if (role === 'rider') {
          this.router.navigate(['/rider-dashboard']);
        } else {
          this.errorMessage =
            'Login succeeded, but the user role was not returned.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.error?.title ||
          'Login failed. Please check your credentials.';
      }
    });
  }
}
