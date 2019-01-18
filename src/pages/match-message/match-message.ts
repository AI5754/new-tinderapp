import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-match-message',
  templateUrl: 'match-message.html',
})
export class MatchMessagePage {
  matcher;
  curUser;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController
  ) { 
    this.matcher = navParams.get('matcher');
    this.curUser = navParams.get('curUser');
  }

  getPic(){
    return this.userProvider.getPic(this.matcher.id);
  }

  closeModal(){
    this.viewCtrl.dismiss();
  }

  //pops a chat page and redirects to matches page
  goChat(){
    let modal = this.modalCtrl.create("ChatPage", {curUser: this.curUser, matcher: this.matcher});
    modal.onDidDismiss(() => {
      this.navCtrl.setRoot('MyMatchesPage', {curUser: this.curUser});
    });
      modal.present();  
  }
}
