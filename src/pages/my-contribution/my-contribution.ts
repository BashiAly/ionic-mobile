import { Component } from '@angular/core';
import { IonicPage,App, NavController, NavParams } from 'ionic-angular';
import { ContributionsProvider } from '../../providers/contributions/contributions';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { PopoverController } from 'ionic-angular';
import { PopoverContributionComponent } from '../../components/popover-contribution/popover-contribution';
import { ContributionDetailsPage } from '../../pages/contribution-details/contribution-details';
import { UserProvider } from '../../providers/user/user';
import { CreateContributionPage } from '../../pages/create-contribution/create-contribution';

/**
 * Generated class for the MyContributionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-contribution',
  templateUrl: 'my-contribution.html',
  providers: [UserProvider, ContributionsProvider, AuthenticationProvider]
})
export class MyContributionPage {
  contributionsList: any = [];
  pendingList: any = [];
  draftedList: any = [];
  loading: any;
  user: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public contributionService: ContributionsProvider,
    public authService: AuthenticationProvider,
    public userService: UserProvider,
    public popoverCtrl: PopoverController,
    public appCtrl: App
    
  ) {
      this.user = this.authService.getCurrentUser();
      var email = this.authService.getCurrentUser().Email;
      this.getContributionByEmail(email);


  }

  ionViewDidLoad() {
  }
  presentPopover() {
    const popover = this.popoverCtrl.create(PopoverContributionComponent);
    popover.present();
  }
  editContribution(contributionsId){
    this.navCtrl.setRoot(CreateContributionPage,{id:contributionsId})
  }
  getContributionByEmail(email) {
    this.loading = true;
    this.contributionService.getUserConstributionsbyEmail(email)
    .subscribe(
      data => {
        if(data.status) {
          data.data.forEach(value => {
          
            if(value.ContributionStatus!="Reject") {
              if(value.AdminStatus && value.ContributionStatus == "Publish") {
                this.getProfileByID(value.UserID, value)
                this.getLikesAndComments(value._id,value);
                this.contributionsList.push(value);
              } if(!value.AdminStatus && value.ContributionStatus == "Publish"){
                this.getProfileByID(value.UserID, value)
                this.pendingList.push(value);
                // this.contributionsList = [];
                this.loading = false;
              } 
              if(value.ContributionStatus == "Draft"){
                this.getProfileByID(value.UserID, value)
                this.draftedList.push(value);
                // this.contributionsList = [];
                this.loading = false;
              } 
            } else {
              this.loading = false;
            }
            
          });
        } else {
          this.pendingList = [];
          this.draftedList = [];
          this.contributionsList = [];
          this.loading = false;
        }

      }
    )
  }

  openDetails(id) {
    this.navCtrl.push(ContributionDetailsPage, {id: id})
  }

  getProfileByID(id,value) {

    this.userService.viewProfileById(id)
      .subscribe(res => {
        if(res.status) {
           value.bio = res.data.Bio
        }
        
  
      });
  }
  getLikesAndComments(id,value) {
    this.contributionService.getLikesAndComments(id)
    .subscribe(data => {
        if(!data.status) {
          value.social = {
            Likes: [],
            Comments: []
          }
        } else if(data.status) {
          value.social = data.data;
        }
  
        if(value.social.Likes && value.social.Likes.length) {
          value.social.Likes.forEach(id => {
            if(this.user._id === id.LikeUserID) {
              value.isLiked = true;
              return;
            } else {
              value.isLiked = false;
            }
          });
        } else {
          value.isLiked = false;
        }
    })
    this.loading = false;
  }


  addLike(value,id) {
    var data = {
      contributionid: id,
      likes: [{
        likeuserid: this.user._id
      }]
    }
  
    this.contributionService.addLike(data)
      .subscribe(res => {
        if(res.status) {
          value.isLiked = true;
            value.Likes = res.data;
        }
  
      })
  }
  unLike(value,id) {
    var data = {
      contributionid: id,
      likes: [{
        likeuserid: this.user._id
      }]
    }
  
    this.contributionService.unLike(data)
      .subscribe(res => {
        if(res.status) {  
            value.isLiked = false;
            value.Likes = res.data;
        }
      })
  }


}
