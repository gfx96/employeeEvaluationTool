import { Component, OnInit } from '@angular/core';
import { DBService } from '../services/db.service';


@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  DBUsers = [];

  constructor(private db: DBService) {
    if (db.isAdmin) {
      this.db.getAllUsersFromDb().subscribe(
        (users) => {
          this.DBUsers.push(users);
          this.DBUsers = this.DBUsers[0];
          this.DBUsers.shift();
        }
      )
    }
  }
  changeVolunteerStatusWithId(statusData, userId) {
    this.db.changeUserStatus(statusData, userId);
  }
  deleteUser(userId) {
    this.db.deleteUser(userId);
  }

  ngOnInit() {
  }

}
