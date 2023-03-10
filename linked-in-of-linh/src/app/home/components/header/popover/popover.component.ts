import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  userFullImagePath: string;

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';
  private userImagePathSubscription: Subscription;

  constructor(
    private popoverController: PopoverController,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    });

    this.authService.userFullName.pipe(take(1)).subscribe((fullName: string) => {
      this.fullName = fullName;
      this.fullName$.next(fullName);
    });

  }
  async onSignOut() {
    await this.popoverController.dismiss();
    this.authService.logout();
    location.reload();
  }

  ngOnDestroy(): void {
    this.userImagePathSubscription.unsubscribe();
  }
}
