import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ViewController, AlertController } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";
import { ImageProvider } from "./../../providers/image/image";

@IonicPage()
@Component({
  selector: "page-user",
  templateUrl: "user.html"
})
export class UserPage {
  curUser;
  user: any = {};
  canUpdate = false;
  oldPreferredGender;
  oldGender;

  defaultPic = 'iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII=';
  hasPic = false;
  showErrorMessage = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    public viewCtrl: ViewController,
    public imgProv: ImageProvider,
    private alertCtrl: AlertController,
  ) { }

  ionViewDidEnter() {
    //set user, curUser
    this.curUser = this.navParams.get("curUser");
    var user = this.navParams.get("user");

    if (this.curUser) {
      if (user) {
        this.user = user.doc;
        this.canUpdate = true;
        this.oldGender = user.doc.gender;
        this.oldPreferredGender = user.doc.preferredGender;
      }
      this.checkAndShowAddUpdateButton(); 
    } else {
      this.user = user;
    }
  }

  addOrUpdate() {
    //names and gender are required
    if (this.user.firstName === undefined || this.user.lastName === undefined || this.user.firstName == "" || this.user.lastName == ""
      || this.user.gender === undefined || this.user.preferredGender === undefined) {
      this.showErrorMessage = true;
    } else {
      //existing users
      if (this.canUpdate) {
        //gender and preferred gender are unchangeable
        if (this.user.gender != this.oldGender || this.user.preferredGender != this.oldPreferredGender) {
          this.presentConfirm();
        } else {
          //updates user
          this.userProvider.update(this.user).catch(() => { });
          this.viewCtrl.dismiss(this.user);
        }
      }
      //new users 
      else {
        this.user.likers = [];
        this.user.usersToShow = [];
        this.user.matches = [];
        
        //creates new user
        this.userProvider.create(this.user).then(this.userProvider.read().then(users => {
          let newAddedUserInd;

          //find index of new user
          for (let ind = 0; ind < users.length; ind++) {
            if (newAddedUserInd === undefined) {
              if (users[ind].doc.firstName == this.user.firstName && users[ind].doc.lastName == this.user.lastName) {
                newAddedUserInd = ind;
              }
            }
          }

          //add new user to list of userstoshow of other users and other users to list of new user
          for (let ind = 0; ind < users.length; ind++) {
            if (ind != newAddedUserInd) {
              //check on gender and preferred gender from users
              if ((users[ind].doc.gender == users[newAddedUserInd].doc.preferredGender || users[newAddedUserInd].doc.preferredGender == "all")
              && (users[ind].doc.preferredGender == users[newAddedUserInd].doc.gender || users[ind].doc.preferredGender == "all")) {
                users[ind].doc.usersToShow.push(users[newAddedUserInd].id);
                users[newAddedUserInd].doc.usersToShow.push(users[ind].id);
                this.userProvider.update(users[ind].doc);
              }
            }
          }
          //update new user with filled usersToShow list
          this.userProvider.update(users[newAddedUserInd].doc);
        })).catch(err => {
          console.log(err);
        });

        this.viewCtrl.dismiss(this.user);
      }
    }
  }

  //shows a popup message that gender and preferred gender are unchangeable
  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Error',
      message: "Gender and preferred gender are unchangeable",
      buttons: [
        {
          text: 'OK',
          role: 'ok',
          handler: () => {
            //set the gender and preferred gender fields back
            this.user.gender = this.oldGender;
            this.user.preferredGender = this.oldPreferredGender;
          }
        }
      ]
    });
    alert.present();
  }


  delete() {
    //remove first his account, than his id's from other accounts
    let isCurUser = this.curUser.id == this.user._id;

    this.userProvider.delete(this.user).then(
      this.userProvider.read().then(users => {
        for (let user of users) {
          if (user.id != this.user._id) {
            let indToRemove = user.doc.likers.findIndex(item => { return item == this.user._id });
            if (indToRemove >= 0) {
              user.doc.likers.splice(indToRemove, 1);
            }
            indToRemove = user.doc.usersToShow.findIndex(item => { return item == this.user._id });
            if (indToRemove >= 0) {
              user.doc.usersToShow.splice(indToRemove, 1);
            }
            this.userProvider.update(user.doc);
          }
        }
      }).then(() => {
        if (isCurUser) {
          this.navCtrl.setRoot('HomePage');
        } else {
          this.viewCtrl.dismiss(this.user);
        }
      }).catch(err => {
        console.log(err);
      })).catch(err => {
        console.log(err)
      });
  }

  //checks if user has picture (pic is required) and setts the hasPic field according to it
  checkAndShowAddUpdateButton() {
    this.hasPic = this.user._attachments;
  }

  getPic() {
    //for existing users fetch picture from db
    //if(this.user._id){
      return this.userProvider.getPic(this.user._id);
    //}
  }

  //takes picture from camera and puts it in attachment
  takePhoto() {
    this.imgProv.takePhotograph()
      .then((myPhoto) => {
        this.user._attachments = {
          'pic.png': {
            content_type: 'image/png',
            data: myPhoto.toString()
          }
        };
        this.userProvider.update(this.user).catch(() => { });
        this.checkAndShowAddUpdateButton();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //takes picture from phone library and puts it in attachment
  selectPhoto() {
    this.imgProv.selectPhotograph()
      .then((myPhoto) => {
        this.user._attachments = {
          'pic.png': {
            content_type: 'image/png',
            data: myPhoto.toString()
          }
        };
        this.userProvider.update(this.user).catch(() => { });
        this.checkAndShowAddUpdateButton();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //takes default picture and puts it in attachment (for testing in windows)
  takeDefaultPic(){
    this.user._attachments = {
      'pic.png': {
        content_type: 'image/png',
        data: this.defaultPic
      }
    }
    
    this.userProvider.update(this.user).catch(() => { });
    this.checkAndShowAddUpdateButton();
  }
}

