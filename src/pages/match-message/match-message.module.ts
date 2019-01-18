import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchMessagePage } from './match-message';

@NgModule({
  declarations: [
    MatchMessagePage,
  ],
  imports: [
    IonicPageModule.forChild(MatchMessagePage),
  ],
})
export class MatchMessagePageModule {}
