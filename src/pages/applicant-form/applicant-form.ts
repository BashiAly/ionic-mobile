import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import * as _ from 'lodash';
import { ContributionsProvider } from '../../providers/contributions/contributions';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
/**
 * Generated class for the ApplicantFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-applicant-form',
  templateUrl: 'applicant-form.html',
})
export class ApplicantFormPage {
  mentor : FormGroup;
  mentorStatus: any;
  types:any='';
  canFill: any;
  user: any;
  isReviewed: any;
  isDisabled: any;
  categoriesName: any = [];
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public authService: AuthenticationProvider,
    public contributionService: ContributionsProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController 
  ) {
    this.user = this.authService.getCurrentUser();
    if(!this.user.FullName && this.user.Age == 0) {
      this.canFill = false;
    } else {
      this.canFill = true;
    }

    this.mentorStatus = JSON.parse(localStorage.getItem('mentorStatus'));
    
    this.mentor = new FormGroup({
      useremail: new FormControl(this.user.Email, [
          Validators.required
        ]),
        userid: new FormControl(this.user._id, Validators.required),
        username: new FormControl(this.user.FullName, Validators.required),
        industry: new FormControl('', Validators.required),
        skillevel: new FormControl('', Validators.required),
        experience: new FormControl('', Validators.required),
        numberofcontribution: new FormControl('', Validators.required),
        workedfor: new FormControl(''),
        companyname: new FormControl(''),
        motivationTxt: new FormControl(''),
        contributiontype: new FormControl(['']),
        donation: new FormControl(false, Validators.required),
        userage: new FormControl(parseInt(this.user.Age), Validators.required)

    });

    this.getAllContributions();
  }

  ionViewDidLoad() {
  }

  getAllContributions() {
    this.contributionService.getAllCategoriesName()
    .subscribe(
      data => {
        if (data.status) {
          data.data.forEach(value => {
            if(value.Category == "") {
              value.Category = "No Category"
            }
            this.categoriesName.push({
              name: value.Category
            })
          });
          this.categoriesName = _.uniqBy(this.categoriesName, 'name');
      
        } else if(!data.status){
          this.categoriesName.push({
            name: "No Category"
          })
        }
      }
    );
  }

  saveMentorForm() {
    let loader =  this.loadingCtrl.create({
      content: 'Please wait...',
    });
    loader.present();
    if(this.mentor.value.contributiontype) {
      this.mentor.value.contributiontype.forEach(value => {
        if(value) {
          this.types+= value+',';
        }
      });
    }
    this.types = this.types.replace(/,\s*$/, "");
    this.mentor.patchValue({
      contributiontype : this.types
    })
    this.contributionService.becomeAMentor(this.mentor.value)
    .subscribe(
      data => {
        if(data.status) {
          loader.dismiss();
          this.showErrorAlert("Mentor form Successfully Submitted");
        } else if(!data.status) {
          loader.dismiss();
          this.showErrorAlert("Mentor form Already Filled");
        }
      }
    )
  }

  showErrorAlert(message) {
    const alert = this.alertCtrl.create({
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
  checkCompany(type) {
    if(type== 'freelance' || type=='self' || type =='professional'){
      this.isDisabled = true;
      this.mentor.get('companyname').setValue('');
      
    } else {
      this.isDisabled = false;
    }
}

}
