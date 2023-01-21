import { buffer, switchMap } from 'rxjs/operators';
import { Subscription, of, take, BehaviorSubject, from } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Role, User } from 'src/app/auth/models/user.model';
import { FormControl, FormGroup } from '@angular/forms';
import { FileTypeResult, fromBuffer } from 'file-type/core';
import { BannerColorService } from '../../services/banner-color.service';

type validFileExtension = 'jpg' | 'png' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpeg' | 'image/jpg';

type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
}
@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {

  form: FormGroup;
  validFileExtensions: validFileExtension[] = ['jpeg', 'png', 'jpg'];
  validMimeTypes: validMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  private userSubscription: Subscription;

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';

  constructor(
    private authService: AuthService,
    public bannerColorService: BannerColorService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      file: new FormControl(null),
    });

    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      // console.log(fullImagePath);
      this.userFullImagePath = fullImagePath;
    });

    this.userSubscription = this.authService.userStream.subscribe((user: User) => {
      if (user?.role) {
        this.bannerColorService.bannerColors =
          this.bannerColorService.getBannerColors(user.role);
      }

      if (user && user?.firstName && user?.lastName) {
        this.fullName = user.firstName + " " + user.lastName;
        this.fullName$.next(this.fullName);
      }
    })

    // this.authService.userRole.pipe(take(1)).subscribe((role: Role) => {
    //   this.bannerColorService.bannerColors = this.bannerColorService.getBannerColors(role);
    // });

    // this.authService.userFullName.pipe(take(1)).subscribe((fullName: string) => {
    //   this.fullName = fullName;
    //   this.fullName$.next(fullName);
    // });


  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }


  onFileSelect(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    from(file.arrayBuffer())
      .pipe(
        switchMap((buffer: Buffer) => {
          return from(fromBuffer(buffer)).pipe(
            switchMap((fileTypeResult: FileTypeResult) => {
              if (!fileTypeResult) {
                //ToDO: error handling
                console.log('File format not supported!');
                return of();
              }
              const { ext, mime } = fileTypeResult;
              const isFileTypeLegit = this.validFileExtensions.includes(ext as any);
              const isMimeypeLegit = this.validMimeTypes.includes(mime as any);
              const isFileLegit = isFileTypeLegit && isMimeypeLegit;
              if (!isFileLegit) {
                console.log({ error: 'file format does not match file extension!' });
                return of();
              }

              return this.authService.uploadUserImage(formData)
            })
          )
        })
      ).subscribe();
    this.form.reset();
  }
}
