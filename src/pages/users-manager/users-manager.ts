import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-users-manager',
  templateUrl: 'users-manager.html',
})
export class UsersManagerPage {
  curUser: any = {};
  public users;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public userProv: UserProvider,
    public navParams: NavParams
  ) { 
    this.curUser = navParams.get('curUser');
  }

  ionViewDidEnter() {
    if(this.curUser){
      //fetches users from db
      this.userProv
        .read()
        .then(users => {
          this.users = users;
        })
        .catch(err => {
          console.log(err);
        });
    }else{
      this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
    }
  }

  //shows modal for profile of curUser
  showCurUser(){
    if(this.curUser != undefined){
      let modal = this.modalCtrl.create("UserPage", { user: this.curUser, curUser:this.curUser });
      modal.onDidDismiss(data => {
        this.reReadUsers();
      });
      modal.present();
    }
  }

  //shows details of specific user
  showDetails(user) {
    let modal = this.modalCtrl.create("UserPage", { user: user, curUser:this.curUser });
    modal.onDidDismiss(() => {
      this.reReadUsers();
    });
    modal.present();
  }

  getPic(user){
    return this.userProv.getPic(user);
  }

  goHome(){
    this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
  }
  
  goMyLikers(){
    this.navCtrl.setRoot('MyLikersPage', {curUser: this.curUser});
  }
  
  goMyMatches(){
    this.navCtrl.setRoot('MyMatchesPage', {curUser: this.curUser});
  }

  //opens modal for a new user
  addUser() {
    let modal = this.modalCtrl.create("UserPage", { user: null, curUser: this.curUser });
    modal.onDidDismiss(() => {
      this.reReadUsers();
    });
    modal.present();
  }

  //updates users and curUser from db
  reReadUsers() {
    this.userProv
      .read()
      .then(users => {
        this.users = users;
        this.curUser = users[users.findIndex(item=>{return item.id == this.curUser.id})];
      })
      .catch(err => {
        console.log(err);
      });
  }
}
