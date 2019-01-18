import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  curUser: any = {};
  foundUser: any = {};

  constructor(
    public navParams: NavParams,
    private userProvider: UserProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
  ) { }

  //redirects to register (for new users)
  goRegister() {
    let modal = this.modalCtrl.create("UserPage", { user: this.curUser });
    modal.onDidDismiss(data => {
      this.curUser = data;
      this.checkLogin();
    });
    modal.present();
  }

  //checks if login is ok. Otherwise redirects to register
  checkLogin() {
    if (this.curUser) {
      this.findUser(this.curUser).then(() => {
        if (this.foundUser.id != undefined) {
          this.viewCtrl.dismiss(this.foundUser);
        }
        else {
          this.goRegister();
        }
      });
    }
    else {
      location.reload();
    }
  }

  //searches a user by first and last name.
  findUser(user) {
    if (user) {
      return this.userProvider
        .read()
        .then(users => {
          for (var ind = 0; ind < users.length; ind++) {
            var u = users[ind];
            if (u.doc.firstName == user.firstName && user.lastName == u.doc.lastName) {
              this.foundUser = users[ind];
            }
          };
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}
