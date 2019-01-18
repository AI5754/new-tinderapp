import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-my-likers',
  templateUrl: 'my-likers.html',
})
export class MyLikersPage {
  curUser: any = {};
  public likers;
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

  //reads users from db and fills likers list
  ionViewDidEnter() {
    if(this.curUser){
      this.userProv
      .read()
      .then(users => {
        this.users = users;
        this.curUser = users[users.findIndex(item=>{return item.id == this.curUser.id})];
        this.likers = this.curUser.doc.likers;
      })
      .catch(err => {
        console.log(err);
      });
    }
    else{
      //redirecting for login to homepage
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
  
  goMyMatches(){
    this.leavePage('MyMatchesPage');
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
          this.curUser.doc = data;  //updates curUser
        }
      });
      modal.present();
    }
  }
  
  swiped(event, user) {
    user = this.users[this.users.findIndex(item => {return item.id == user})];
    
    //swipe left = dislike
    if (event.direction === 2){
      //remove both users of the other users list of usersToShow
      this.removeUserFromUsersToShowList(this.curUser, user.id);
      this.removeUserFromLikersList(this.curUser, user.id);
    }

    //swipe right = like
    else if (event.direction === 4){
      //adds the matchers to their matchers list and 
      //removes liked user from current users list of users to show and likers lists
      user.doc.matches.push(this.curUser.id);
      this.curUser.doc.matches.push(user.id);
      this.removeUserFromLikersList(this.curUser, user.id);
      this.removeUserFromUsersToShowList(this.curUser, user.id);

      //in likers page every like is a match
      let modal = this.modalCtrl.create("MatchMessagePage", { matcher: user, curUser: this.curUser });
      modal.present();
    }
  }

  //removes id of userIdToRemove from likers list of user
  removeUserFromLikersList(user, userIdToRemove){
    let indToRem = user.doc.likers.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){
      user.doc.likers.splice(indToRem, 1);
    }

    //if needed updates likers list
    if(user.id == this.curUser.id){
      this.likers = this.curUser.doc.likers;
    }
  }

  //removes id of userIdToRemove from usersToShow list of user
  removeUserFromUsersToShowList(user, userIdToRemove){   
    let indToRem = user.doc.usersToShow.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){    
      user.doc.usersToShow.splice(indToRem, 1);
    }
  }
}
