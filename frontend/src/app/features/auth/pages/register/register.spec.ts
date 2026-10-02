import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../../../../core/services/auth.service';
import { Register } from './register';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  const register = vi.fn(() => of(undefined));

  beforeEach(async () => {
    register.mockReset();
    register.mockReturnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([{ path: 'login', component: Register }]),
        { provide: AuthService, useValue: { register } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
  });

  it('keeps submission disabled until all password rules and confirmation are valid', () => {
    const [username, password, confirmation] = inputs();
    setInput(username, 'new.viewer');
    setInput(password, 'NoNumber!');
    setInput(confirmation, 'NoNumber!');
    fixture.detectChanges();
    expect(submitButton().disabled).toBe(true);

    setInput(password, 'SafePass!9');
    setInput(confirmation, 'different');
    fixture.detectChanges();
    expect(submitButton().disabled).toBe(true);

    setInput(confirmation, 'SafePass!9');
    fixture.detectChanges();
    expect(submitButton().disabled).toBe(false);
  });

  it('registers valid credentials and redirects to login', async () => {
    const [username, password, confirmation] = inputs();
    setInput(username, 'new.viewer');
    setInput(password, 'SafePass!9');
    setInput(confirmation, 'SafePass!9');
    fixture.detectChanges();

    submitButton().click();
    await fixture.whenStable();

    expect(register).toHaveBeenCalledWith({ username: 'new.viewer', password: 'SafePass!9' });
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('shows the duplicate User ID error returned by the API', () => {
    register.mockReturnValueOnce(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { username: ['This User ID is already registered.'] },
          }),
      ),
    );
    const [username, password, confirmation] = inputs();
    setInput(username, 'existing.user');
    setInput(password, 'SafePass!9');
    setInput(confirmation, 'SafePass!9');
    fixture.detectChanges();

    submitButton().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('This User ID is already registered.');
  });

  function inputs(): readonly HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input'));
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function setInput(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
});
