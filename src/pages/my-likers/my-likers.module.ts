import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyLikersPage } from './my-likers';

@NgModule({
  declarations: [
    MyLikersPage,
  ],
  imports: [
    IonicPageModule.forChild(MyLikersPage),
  ],
})
export class MyLikersPageModule {}
