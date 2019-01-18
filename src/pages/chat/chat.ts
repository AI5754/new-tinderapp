import { Component } from "@angular/core";
import { IonicPage, /*NavController, ModalController, */ViewController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  curUser;
  matcher;
  
  constructor(
    //public navCtrl: NavController, 
    public navParams: NavParams, 
    public userProv: UserProvider, 
    //public modalCtrl: ModalController,
    public viewCtrl: ViewController 
    ){
      this.curUser = navParams.get('curUser');
      this.matcher = navParams.get('matcher');
    }

  getFirstName(){
    return this.matcher.doc.firstName;
  }

  getLastName(){
    return this.matcher.doc.lastName;
  }

  getPic(){
    return this.userProv.getPic(this.matcher.id);
  }

  closeModal(){
    this.viewCtrl.dismiss(this.curUser);
  }
}
