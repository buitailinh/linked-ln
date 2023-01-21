import { NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserNew } from './models/userNew.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  @ViewChild('form') form: NgForm;
  submissionType: "login" | 'join' = 'login';
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    const { email, password } = this.form.value;
    if (!email || !password) return;

    if (this.submissionType === 'login') {
      return this.authService.login(email, password).subscribe(() => {
        this.router.navigateByUrl('/home');
      });
    } else if (this.submissionType === 'join') {
      const { firstName, lastName } = this.form.value;
      if (!firstName || !lastName) return;

      const newUser: UserNew = { firstName, lastName, email, password };

      return this.authService.register(newUser).subscribe(() => {
        this.toggleText();
      });
    }
  }

  toggleText() {
    if (this.submissionType === 'login') {
      this.submissionType = 'join';
    } else if (this.submissionType === 'join') {
      this.submissionType = 'login';
    }
  }

}
