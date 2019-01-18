import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyMatchesPage } from './my-matches';

@NgModule({
  declarations: [
    MyMatchesPage,
  ],
  imports: [
    IonicPageModule.forChild(MyMatchesPage),
  ],
})
export class MyMatchesPageModule {}
