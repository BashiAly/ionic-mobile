import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { HomePage } from '../home/home';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { EditUserPage } from '../user/edit-user/edit-user';
import { AlertController } from 'ionic-angular';
import { LoadingController,ModalController, Platform } from 'ionic-angular';
import {ForgotPasswordPage} from'../forgot-password/forgot-password';
import { UserProfilePage } from '../user-profile/user-profile';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [AuthenticationProvider]
})
export class LoginPage {

  loginForm: FormGroup;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: AuthenticationProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public menu : MenuController
  ) {

  }

  ionViewDidLoad() {
    this.loginForm = this.formBuilder.group({
      Email: ['', [Validators.required,Validators.email]],
      Password: ['', Validators.required]
    })

  }
  get form() {return this.loginForm.controls}
  openSignupPage() {
    this.navCtrl.push(SignupPage);
  }
  login() {
    let loader =  this.loadingCtrl.create({
      content: 'Please wait...',
    });
    loader.present();
    this.auth.login(this.loginForm.value)
    .subscribe(
      data =>{
        if(data.status) {
          var user = data.data;
          if(user.FullName && user.Bio && user.Age && user.City && user.ZipCode && user.UserType == 'user' && user.AboutMe) {
            
            this.navCtrl.setRoot(UserProfilePage,{id: user._id})
            // return;
          }
          if(user.UserType == 'admin'){
            // this.navCtrl.setRoot(UserProfilePage,{id: user._id})
            this.navCtrl.setRoot(UserProfilePage,{id: user._id})
            // return;
          }

          if(user.UserType == 'user' && (!user.FullName || !user.Bio || !user.Age || !user.City || !user.ZipCode || !user.AboutMe)) {
            this.navCtrl.setRoot(EditUserPage)
            // return;
          }
       
          loader.dismiss();
        } else if(!data.status){
          loader.dismiss();
          this.showErrorAlert(data.message)
        }
      }
    );
    // this.navCtrl.setRoot(EditUserPage)
  }
  forgot(){
    this.navCtrl.setRoot(ForgotPasswordPage)
  }
  showErrorAlert(message) {
    const alert = this.alertCtrl.create({
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  ionViewCanEnter(){

    if(this.auth.isLoggedIn()) {
      var user = this.auth.getCurrentUser();
      if(user.FullName && user.Bio && user.Age && user.City && user.ZipCode && user.UserType == 'user' && user.AboutMe) {
        
        this.navCtrl.setRoot(UserProfilePage,{id: user._id})
        // return;
      }
      if(user.UserType == 'admin'){
        // this.navCtrl.setRoot(UserProfilePage,{id: user._id})
        this.navCtrl.setRoot(UserProfilePage,{id: user._id})
        // return;
      }

      if(user.UserType == 'user' && (!user.FullName || !user.Bio || !user.Age || !user.City || !user.ZipCode || !user.UserType || !user.AboutMe)) {
        this.navCtrl.setRoot(EditUserPage)
        // return;
      }
    }
   }
   ionViewDidEnter() {
    this.menu.swipeEnable(false);

    // If you have more than one side menu, use the id like below
    // this.menu.swipeEnable(false, 'menu1');
  }

  ionViewWillLeave() {
    // Don't forget to return the swipe to normal, otherwise 
    // the rest of the pages won't be able to swipe to open menu
    this.menu.swipeEnable(true);

    // If you have more than one side menu, use the id like below
    // this.menu.swipeEnable(true, 'menu1');
   }


}
