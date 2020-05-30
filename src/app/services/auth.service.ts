import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppSettings } from "../../environments/environment";
import { throwError } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  timeoutErrCount = 0;
  errCount = 0;
  reqCount = 0;
  apiEndpoint: string;

  constructor(private http: HttpClient,
    private toastr: ToastrService) {
    this.apiEndpoint = AppSettings.API_ENDPOINT;
   }
  
  make_get_request(url) {
    let isOnline: boolean = navigator.onLine;
    if (!isOnline) {
      this.reqCount++;
      if (this.reqCount == 1)
          console.log("You are no longer connected to internet. Please retry after you are back online.");
      return;
    } else {
      this.reqCount = 0;
    }
    let headers = new HttpHeaders().set("Content-Type", "application/json");
    return new Promise((resolve, reject) => {
      this.http
        .get(this.apiEndpoint + url, { headers: headers })
        .subscribe(data => { resolve(data); }, err => { this.handleError(err) });
    });
  }

  
  make_post_request(url, info) {
    let headers = new HttpHeaders().set("Content-Type", "application/json");
    return new Promise((resolve, reject) => {
      this.http
        .post(this.apiEndpoint + url, info, { headers: headers })
        .subscribe(data => { resolve(data); }, err => { this.handleError(err) })
    });
  }

  make_delete_request(url) {
    let headers = new HttpHeaders().set("Content-Type", "application/json");

    return new Promise((resolve, reject) => {
      this.http.delete(this.apiEndpoint + url, { headers: headers })
        .subscribe(data => { resolve(data); }, err => { this.handleError(err) });
    });    
  }

  handleError(err, method:string = 'Request') {
    this.errCount++;
    let errMsg;
    if (err.toString().includes('Timeout')) {
      this.timeoutErrCount++;
      this.errCount--;
      if (this.timeoutErrCount == 1) {
        errMsg = 'Timeout error occured. Our service seem to be responding slow!.';
        this.toastr.error(errMsg);
        console.log(errMsg);
      }
      setTimeout(() => { this.timeoutErrCount = 0;}, 30000);
    } else {
      if (this.errCount == 1) {
        errMsg = 'An error occured! We are working on it. Please try again after sometime.';
        this.toastr.error(errMsg);
        console.log(errMsg);
      }
      setTimeout(() => { this.errCount = 0;}, 20000);  
    }
    return throwError(err);
  }

  
  post_user_details(info) {
    return this.make_post_request('users', info);
  }

  get_all_users(){
    return this.make_get_request('users');
  }

  authenticate_user_details(info) {
    return this.make_post_request('users/auth', info);
  }

  post_user_log_data(info){
    return this.make_post_request('users/userLog', info);
  }

  get_user_logs(id){
    return this.make_get_request(`users/userLog/${id}`)
  }

  delete_user_log(id){
    return this.make_delete_request(`users/userLog/${id}`)
  }
}
