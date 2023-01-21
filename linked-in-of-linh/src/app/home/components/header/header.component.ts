import { tap } from 'rxjs/operators';
import { ConnectionProfileService } from 'src/app/home/services/connection-profile.service';
import { FriendRequestsPopoverComponent } from './friend-requests-popover/friend-requests-popover.component';
import { PopoverComponent } from './popover/popover.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendRequest } from '../../services/models/FriendRequest';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  friendRequests: FriendRequest[];
  private friendRequestSubscription: Subscription;

  constructor(
    public popoverController: PopoverController,
    private authService: AuthService,
    public connectionProfileService: ConnectionProfileService
  ) { }

  ngOnInit() {

    this.authService.getUserImageName().pipe(
      take(1),
      tap(({ imageName }) => {
        const defaultImageName = 'blank-profile-picture-973460__340.webp';
        this.authService.updateUserImagePath(imageName || defaultImageName)
          .subscribe();
      })
    ).subscribe();

    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    });

    this.friendRequestSubscription = this.connectionProfileService
      .getFriendRequests()
      .subscribe((friendRequests: FriendRequest[]) => {
        this.connectionProfileService.friendRequests = friendRequests.filter(
          (friendRequest: FriendRequest) => friendRequest.status === 'pending'
        );
      });
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: false,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentFriendRequestPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: FriendRequestsPopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: false,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  ngOnDestroy(): void {
    this.userImagePathSubscription.unsubscribe();
    this.friendRequestSubscription.unsubscribe();
  }
}
