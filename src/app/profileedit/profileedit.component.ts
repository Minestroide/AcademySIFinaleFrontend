import {Component, OnInit} from '@angular/core';
import {IUser, QrData, UserService} from "../../services/user.service";
import {NgIf} from "@angular/common";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {QrCodeModule} from "ng-qrcode";

@Component({
  selector: 'app-profileedit',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    QrCodeModule
  ],
  templateUrl: './profileedit.component.html',
  styleUrl: './profileedit.component.css'
})
export class ProfileeditComponent implements OnInit{

  private userService: UserService;
  public user: IUser | undefined;

  public newEmail = new FormControl('');
  public newUsername = new FormControl('');

  public oldPassword = new FormControl('');
  public newPassword = new FormControl('');
  public confirmPassword = new FormControl('');

  public twoFactorSecret: QrData | undefined = undefined;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit() {
    this.userService.getUsersMe().subscribe((user) => {
      this.user = user;
    });
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault();

    if(!this.newEmail.value && !this.newUsername.value) {
      alert("Nothing to update.");
      return;
    }

    this.userService.updateMe({
      email: this.newEmail.value || undefined,
      username: this.newUsername.value || undefined
    }).subscribe(() => {
      this.newUsername.setValue('');
      this.newEmail.setValue('');
      alert("Profile updated successfully.");
    });
  }

  onSubmitNewPassword(event: SubmitEvent) {
    event.preventDefault();

    console.info(this.oldPassword.value);

    if(!this.oldPassword.value || !this.newPassword.value || !this.confirmPassword.value) {
      alert("All fields are required.");
      return;
    }

    this.userService.changePassword(this.oldPassword.value, this.newPassword.value, this.confirmPassword.value).subscribe((resp) => {
      this.oldPassword.setValue('');
      this.newPassword.setValue('');
      this.confirmPassword.setValue('');
      alert("Password changed successfully.");
    });
  }

  twoFactorCode: FormControl = new FormControl('');

  qrCodeRequest(event: MouseEvent) {
    this.userService.get2FASecret().subscribe((secret) => {
      this.twoFactorSecret = secret;
    });
  }

  twoFactorEnable(event: MouseEvent) {
    this.userService.enable2FA(this.twoFactorSecret!.secret, this.twoFactorCode.value).subscribe(() => {
      alert("2FA enabled successfully.");
      this.twoFactorSecret = undefined;
      this.twoFactorCode.setValue('');
      this.userService.clearCache();
      this.userService.getUsersMe().subscribe((user) => {
        this.user = user;
      });
    });
  }

  twoFactorDisable(event: MouseEvent) {
    this.userService.disable2FA(this.twoFactorCode.value).subscribe(() => {
      alert("2FA disabled successfully.");
      this.userService.clearCache();
      this.userService.getUsersMe().subscribe((user) => {
        this.user = user;
      });
    });
  }
}
