
import { ModalComponent } from './modal/modal.component';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss'],
})
export class StartPostComponent implements OnInit, OnDestroy {
  @Output() create: EventEmitter<any> = new EventEmitter();

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(
    public modalController: ModalController,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    })
  }

  async presentModal() {
    console.log('CREATE POST');
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2'
    })
    await modal.present()
    const { data } = await modal.onDidDismiss();
    console.log(data)
    if (!data) return;
    console.log(data.post.body)
    this.create.emit(data.post.body);

  }

  ngOnDestroy(): void {
    this.userImagePathSubscription.unsubscribe();
  }
}
