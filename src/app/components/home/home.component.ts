import { Component, OnInit } from '@angular/core';
import { CountupTimerService, timerTexts,countUpTimerConfigModel } from "ngx-timer";
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from "moment";
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  timer: any;
  userId: any;
  userLogs: any;
  testConfig: any;
  selectedDate: any;
  todayDate = moment().format().substring(0,10)
  allUserLogsData: any;
  userDetails: any;

  constructor(public countupTimerService: CountupTimerService,
    private toastr: ToastrService,
    public apiService: AuthService,
    public router: Router,
    public route: ActivatedRoute) { 
      this.route.params.subscribe((params) => {
        console.log('selected category...', params['id']);
        this.userId = params['id'];
        this.getUSerLogs(params['id']);
      })
     this.userDetails = JSON.parse(localStorage.getItem('userDetails'));
    }
 

  ngOnInit(): void {
    // this.countupTimerService.startTimer();
    this.testConfig = new countUpTimerConfigModel();
    let cdate = new Date();
    this.countupTimerService.startTimer(cdate);
  }

  handleEvent(event){
      let timer;
      if(event['path'][2].localName != 'div'){
        timer = event['path'][2].innerText;
      }else{
        timer = event['path'][2].childNodes[0].childNodes[1].innerText;
      }
      timer = timer.split(' ')[0].substring(0,2) +':'+timer.split(' ')[1].substring(0,2)+':'+timer.split(' ')[2].substring(0,2);
      this.timer = timer;

  }

  filterLogByDates(date){
    // this.getUSerLogs(this.userId);
    this.userLogs = this.allUserLogsData;
      this.userLogs = this.userLogs.filter((data) => data.loginTime.includes(date));      
  }

  pauseTimer(){
    this.countupTimerService.pauseTimer();
  }

  startTimer(){
    this.countupTimerService.startTimer();
  }

  getUSerLogs(id){
    this.apiService.get_user_logs(id)
    .then((res) => {
      this.allUserLogsData = res;
      this.userLogs = res;
    })
  }

  deleteUserLog(id){
    this.apiService.delete_user_log(id)
    .then((res: any) => {
        this.toastr.success(res)
        this.getUSerLogs(this.userId);
    })
  }

  logout(){
    let doc = document.getElementById('counterValue');
    doc.click();

    let storageData = JSON.parse(localStorage.getItem('userTimeFrames'));
    console.log('data..', storageData);
    storageData.logoutTime = moment().format();
    storageData.hoursWorked = this.timer;
    let momentTime = moment(storageData.loginTime).format();

    this.apiService.post_user_log_data(storageData)
    .then((res) => {
    }).catch((err) => {
      console.log(err);
    });
    this.toastr.success('Logged out successfully');
    this.router.navigate(['/']);
    localStorage.removeItem('userTimeFrames');
  }
}
