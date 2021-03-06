import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

export interface localStorageUser {
  username: string,
  name: string,
  adminStatus: string,
  userStatus: string
}

@Injectable({
  providedIn: 'root'
})
export class RegisterLoginService {

  getUserUrl = 'http://localhost:3000/users?username=';
  createUserUrl = 'http://localhost:3000/users';

  loggedUser: localStorageUser;

  IsAuth: boolean = localStorage ? true : false;
  isAdmin: boolean = false;
  nameOfUser;

  registerErrMsg = new Subject<string>();
  loginErrMsg = new Subject<string>();

  constructor(private http: HttpClient, private route: Router) {
    if (localStorage.getItem('loggedUser')) {
      const localStorageData: localStorageUser = this.getLoggedUserOnLocalStorage()
      this.loggedUser = {
        username: localStorageData.username,
        name: localStorageData.name,
        adminStatus: localStorageData.adminStatus,
        userStatus: localStorageData.userStatus
      }
      this.isAdmin = this.loggedUser.adminStatus === 'admin' ? true : false;
      this.nameOfUser = this.loggedUser.name ? this.loggedUser.name : '';

    } else {
      this.IsAuth = false;
    }
  }

  saveLoggedUserOnLocalStorage(username, nameOfUser, adminStatus, userStatus) {
    const user = {
      username: username,
      name: nameOfUser,
      adminStatus: adminStatus,
      userStatus: userStatus
    }
    localStorage.setItem('loggedUser', JSON.stringify(user));
  }

  getLoggedUserOnLocalStorage() {
    const localStorageData = localStorage.getItem('loggedUser');
    if (localStorage) {
      this.loggedUser = JSON.parse(localStorageData);
      return JSON.parse(localStorageData);
    }
  }

  checkIfUserExists(username): Observable<any> {
    return this.http.get(this.getUserUrl + username);
  }

  login(data) {
    this.checkIfUserExists(data.username).subscribe(
      (dbUser) => {
        if (dbUser.length === 1) {
          const verifyCreditials: boolean = data.username === dbUser[0].username && data.password === dbUser[0].password;
          if (verifyCreditials) {
            dbUser[0].adminStatus === 'admin' ? this.isAdmin = true : this.isAdmin = false;
            this.IsAuth = true;
            dbUser[0].adminStatus === 'admin' ? this.route.navigate(['/admin']) : this.route.navigate(['/evaluation']);
            this.nameOfUser = dbUser[0].name;
            this.saveLoggedUserOnLocalStorage(dbUser[0].username, dbUser[0].name, dbUser[0].adminStatus, dbUser[0].userStatus);
          } else {
            this.loginErrMsg.next("The username password combination is wrong!")
          }
        } else {
          this.loginErrMsg.next("You need to register first!")
        }
      }
    )
  }

  register(data) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let options = { headers: headers };


    this.checkIfUserExists(data.username).subscribe(
      (dbUser) => {
        console.log(dbUser);
        if (dbUser.length === 1) {
          this.registerErrMsg.next("This user is already registered, please log in!")
        } else {
          return this.http.post(this.createUserUrl, data, options)
            .subscribe(
              (registeredUser: localStorageUser) => {
                this.saveLoggedUserOnLocalStorage(registeredUser.username, registeredUser.name, registeredUser.adminStatus, registeredUser.userStatus);
                registeredUser.adminStatus === 'admin' ? this.isAdmin = true : this.isAdmin = false;
                registeredUser.adminStatus === 'admin' ? this.route.navigate(['/admin']) : this.route.navigate(['/evaluation']);
                this.IsAuth = true;
              }
            );
        }
      }
    )
  }

}
