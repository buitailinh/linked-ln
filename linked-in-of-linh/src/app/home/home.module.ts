import { ChatComponent } from './components/chat/chat.component';
import { FriendRequestsPopoverComponent } from './components/header/friend-requests-popover/friend-requests-popover.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ConnectionProfileComponent } from './components/connection-profile/connection-profile.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { AllPostsComponent } from './components/all-posts/all-posts.component';
import { ModalComponent } from './components/start-post/modal/modal.component';
import { AdvertisingComponent } from './components/advertising/advertising.component';
import { StartPostComponent } from './components/start-post/start-post.component';
import { ProfileSummaryComponent } from './components/profile-summary/profile-summary.component';
import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { PopoverComponent } from './components/header/popover/popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    HeaderComponent,
    PopoverComponent,
    ProfileSummaryComponent,
    StartPostComponent,
    AdvertisingComponent,
    ModalComponent,
    AllPostsComponent,
    TabsComponent,
    ConnectionProfileComponent,
    UserProfileComponent,
    FriendRequestsPopoverComponent,
    ChatComponent,

  ]
})
export class HomePageModule { }
