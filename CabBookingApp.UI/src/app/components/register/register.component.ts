
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterDto } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: RegisterDto = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: ''
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.form.phoneNumber)) {
      this.errorMessage = 'Enter a valid 10-digit phone number.';
      return;
    }

    this.loading = true;

    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage =
          'Registration successful! Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.error?.title ||
          'Registration failed. Please try again.';
      }
    });
  }
}
