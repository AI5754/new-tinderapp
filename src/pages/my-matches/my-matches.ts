import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-my-matches',
  templateUrl: 'my-matches.html',
})
export class MyMatchesPage {
  curUser: any = {};
  public matches = [];
  users;
  updated = false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public userProv: UserProvider,
    public navParams: NavParams
  ) { 
    this.curUser = navParams.get('curUser');
  }

  //reads users from db and fills matches list
  ionViewDidEnter() {
    if(this.curUser){      
      this.userProv
        .read()
        .then(users => {
          this.users = users;
          this.curUser = users[users.findIndex(item=>{return item.id == this.curUser.id})];      
          this.matches = this.curUser.doc.matches;
        })
        .catch(err => {
          console.log(err);
        });
    }
    else{
      this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
    }
  }

  ionWillLeave(){
    this.leavePage(null);
  }

  leavePage(page){
    if(!this.updated){
      //db update
      if(this.users){
        this.userProv.read()
          .then(users => {
            for (let ind = 0; ind < users.length; ind++) {
              this.users[ind].doc._rev = users[ind].doc._rev;
              this.userProv.update(this.users[ind].doc);    
            }
          }).then(() => {
            this.updated = true;
            if(page){
              this.navCtrl.setRoot(page, {curUser: this.curUser});
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }
  
  getFirstName(user){
    if(this.users){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.firstName;
    }
  }

  getLastName(user){
    if(this.users){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.lastName;
    }
  }

  getPic(user){
    if(this.users){
      return this.userProv.getPic(user);
    }
  }

  goHome(){
    this.leavePage('HomePage');
  }
  
  goMyLikers(){
    this.leavePage('MyLikersPage');
  }

  goUsersManager(){
    this.leavePage('UsersManagerPage');
  }

  //shows modal for profile of curUser
  showCurUser(){
    if(this.curUser != undefined){
      let modal = this.modalCtrl.create("UserPage", { user: this.curUser, curUser: this.curUser });
      modal.onDidDismiss(data => {
        if(data){
          this.curUser.doc = data;  //updating curUser
        }
      });
      modal.present();
    }
  }

  //redirects to chat page
  goChat(matcherId){
    if(this.users){
      let matcher = this.users[this.users.findIndex(item => {return item.id == matcherId})];
      let modal = this.modalCtrl.create("ChatPage", {curUser: this.curUser, matcher: matcher});
      modal.present();  
    }
  }
}
