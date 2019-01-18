import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  curUser: any = {};
  public users;
  usersToShow;
  updated = false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public userProv: UserProvider,
    public navParams: NavParams
  ) { 
    this.curUser = navParams.get('curUser');
  }

  ionViewDidEnter() {
    this.userProv.createPouchDB();

    // redirect to LoginPage
    if(this.curUser === undefined){
      let modal = this.modalCtrl.create("LoginPage", { curUser: this.curUser });
      modal.onDidDismiss(data => {
        this.curUser = data;
        //check inserted user in login page
        if(this.curUser){
          this.readUsers();
        }
        else{
          modal.present();
        }
      });
      modal.present();
    } else{
      this.readUsers();   
    }
  }

  ionViewWillUnload(){    
    this.leavePage(null);
  }

  leavePage(page){
    if(!this.updated){
      //db update
      this.userProv.read()
      .then(users => {
        for (let ind = 0; ind < users.length; ind++) {
          this.users[ind].doc._rev = users[ind].doc._rev;   //changes with every update. Therefore needs to be set. Otherwise db conflict error
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

  getFirstName(user){
    if(user){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.firstName;
    }
  }

  getLastName(user){
    if(user){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.lastName;
    }
  }

  getPic(userId){
    if(userId){
      return this.userProv.getPic(userId);
    }
  }

  goMyLikers(){
    this.leavePage('MyLikersPage');
  }

  goMyMatches(){
    this.leavePage('MyMatchesPage');
  }

  goUsersManager(){
    this.leavePage('UsersManagerPage');
  }
  
  //shows modal for profile of curUser
  showCurUser(){
    if(this.curUser){
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
      this.removeUserFromUsersToShowList(user, this.curUser.id);
    }
    //swipe right = like
    else if (event.direction === 4){
      //removes liked user from current users list of users to show
      this.removeUserFromUsersToShowList(this.curUser, user.id);

      //in case of match: adds both users to other users match list and removes other user from current users likers list
      if(this.isMatch(user)){
        user.doc.matches.push(this.curUser.id);
        this.curUser.doc.matches.push(user.id);
        this.removeUserFromLikersList(this.curUser, user.id);
        
        //shows match message
        let modal = this.modalCtrl.create("MatchMessagePage", { matcher: user, curUser: this.curUser });
        modal.present();
      }
      else{
        //adds curUser to liked users likers list
        user.doc.likers.push(this.curUser.id);
      }
    }
  }

  //removes id of userIdToRemove from likers list of user
  removeUserFromLikersList(user, userIdToRemove){
    let indToRem = user.doc.likers.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){
      user.doc.likers.splice(indToRem, 1);
    }
  }

  //removes id of userIdToRemove from usersToShow list of user
  removeUserFromUsersToShowList(user, userIdToRemove){   
    let indToRem = user.doc.usersToShow.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){    
      user.doc.usersToShow.splice(indToRem, 1);
      
      //if needed update usersToShow list
      if(user.id == this.curUser.id){
        this.usersToShow = this.curUser.doc.usersToShow;
      }
    }
  }

  //returns if two users are a match
  isMatch(user2){
    if(this.curUser && user2){
      if(this.curUser.doc.likers.findIndex(item=>{return item == user2.id}) >= 0){
        return true;
      }
    }
    return false;
  }

  //reads users from db and fills fields of users, curUser and usersToShow
  readUsers() {
    this.userProv
      .read()
      .then(users => {
        this.users = users;
        this.usersToShow = this.curUser.doc.usersToShow;
        this.curUser = users[users.findIndex(item=>{return item.id == this.curUser.id})];
      })
      .catch(err => {
        console.log(err);
      });
  }
}
