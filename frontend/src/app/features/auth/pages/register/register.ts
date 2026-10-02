import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';

interface RegisterForm {
  readonly username: FormControl<string>;
  readonly password: FormControl<string>;
  readonly confirmPassword: FormControl<string>;
}

type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

const NUMBER_PATTERN = /\d/;
const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9\s]/;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = new FormGroup<RegisterForm>({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(NUMBER_PATTERN),
        Validators.pattern(SPECIAL_CHARACTER_PATTERN),
      ],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  private readonly password = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });
  private readonly confirmPassword = toSignal(this.form.controls.confirmPassword.valueChanges, {
    initialValue: '',
  });
  protected readonly passwordStrength = computed<PasswordStrength>(() => {
    const password = this.password();
    const meetsRequirements =
      password.length >= 8 &&
      NUMBER_PATTERN.test(password) &&
      SPECIAL_CHARACTER_PATTERN.test(password);

    if (!meetsRequirements) {
      return 'Weak';
    }
    if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password)) {
      return 'Strong';
    }
    return 'Medium';
  });
  protected readonly passwordsMatch = computed(() => this.password() === this.confirmPassword());

  protected submit(): void {
    if (this.form.invalid || !this.passwordsMatch() || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.authService
      .register({ username, password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/login'], { state: { registered: true } }),
        error: (response: HttpErrorResponse) => this.handleRegistrationError(response),
      });
  }

  private handleRegistrationError(response: HttpErrorResponse): void {
    const usernameErrors = response.error?.username;
    if (Array.isArray(usernameErrors) && usernameErrors.length > 0) {
      this.form.controls.username.setErrors({ duplicate: true });
      this.form.controls.username.markAsTouched();
      this.error.set(null);
      return;
    }
    this.error.set('Registration could not be completed. Check your details and try again.');
  }
}
