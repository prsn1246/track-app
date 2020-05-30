import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
} from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from "ngx-toastr";
import * as moment from "moment";

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  showRegisterForm = false;
  loginForm: FormGroup;
  registerForm: FormGroup;
  phonepattern = "^[6-9]{1}[0-9]{9}";
  emailpattern = /^([A-Za-z0-9_\-\.])+\@(?!(?:[A-Za-z0-9_\-\.]+\.)?([A-Za-z]{2,4})\.\2)([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  constructor( public router: Router, 
    public apiService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService) { 

    this.registerForm = formBuilder.group({
      full_name: ["", Validators.required],
      password: ["", Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(this.emailpattern)
        ],
      ],
      contact_number: [
        null,
        [
          Validators.required,
          Validators.min(6),
          Validators.pattern(this.phonepattern)
        ],
      ]
    });

    this.loginForm = formBuilder.group({
      password: ["", Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(this.emailpattern)
        ],
      ]
    });

  }

  ngOnInit(): void {
  }

  get r(){
    return this.registerForm.controls;
  }

  get l(){
    return this.loginForm.controls;
  }

  showForm(){
    this.showRegisterForm = !this.showRegisterForm;
    this.registerForm.reset();
    this.loginForm.reset();
  }

  submitRegisterData(values){
    this.registerForm.markAllAsTouched();
    if (this.registerForm.status == 'VALID') {
      let info = {
        "fullName" : this.r.full_name.value,
        "password": this.r.password.value,
        "emailAddress": this.r.email.value,
        "phoneNumber" : this.r.contact_number.value
      }
      this.apiService.post_user_details(info)
      .then((res) => {
        if(res['message'].includes('Success')){
          this.toastr.success('Successfully registered in please login');
          this.registerForm.reset();
          this.showForm();
        }else{
          this.toastr.error(res['message']);
        }
      })
    }
  }

  submitLogin(values){
    this.loginForm.markAllAsTouched();
    if (this.loginForm.status == 'VALID') {
      let info = {
        emailAddress: this.l.email.value,
        password: this.l.password.value,
      }
      console.log('login info', info);
      this.apiService.authenticate_user_details(info)
      .then((res) => {
        if(res['message'].includes('Success')){
          this.toastr.success(res['message']);
          this.loginForm.reset();
          let logintrack = {
            loginTime: moment().format(),
            userId: res['data'].userId,
            logoutTime: '',
            hoursWorked: ''
          }
          localStorage.setItem('userTimeFrames', JSON.stringify(logintrack));
          localStorage.setItem('userDetails', JSON.stringify(res['data']));
          this.router.navigate(['/home',res['data'].userId]);
        }else{
          this.toastr.error(res['message']);
        }
      })

    }
  }

}
