import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatCheckboxChange } from '@angular/material';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-guest-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  displayedColumns: string[] = [
    "inviteName",
    "checkIn",
    "checkOut",
    "over21"
  ]
  apiUrl: string;
  invites: any;
  onlyShowCheckedIn: boolean = false;
  
  constructor(public dialog: MatDialog,
    @Inject(HttpClient) private _http: HttpClient ) { }

  ngOnInit() {
    this.apiUrl = `${environment.apiUrl}/api`;

    this.getSheetInvites();
  }

  checkIn(invite: Invite): void {
    let index = this.getInviteIndex(invite);
    let d = new Date();
    this.invites[index].checkInTime = d;
    this._http.post(`${this.apiUrl}/checkin`, this.invites[index]).subscribe((res) => console.log(res));
  }
  
  checkOut(invite: Invite): void {
    let index = this.getInviteIndex(invite);
    let time = new Date();
    this.invites[index].checkOutTime = time;
    this._http.post(`${this.apiUrl}/checkout`, this.invites[index]).subscribe((res) => console.log(res));
  }

  toggle21(invite: Invite,event: MatCheckboxChange): void {
    let index = this.getInviteIndex(invite);
    this.invites[index].isOver21 = event.checked;
    this._http.post(`${this.apiUrl}/toggle21`,this.invites[index])
      .subscribe(res => console.log(res));
  }

  undoAction(input: string, _invite: Invite): void {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Undo",
        message: `Are you sure you want to undo ${input} for ${_invite.inviteName}?`
      }
    })
    dialogRef.afterClosed().subscribe( (result) => {
      if (result){
        let index: number;
        switch (input) {
          case "check in":
            index = this.getInviteIndex(_invite);
            this.invites[index].checkInTime = null;
            this.invites[index].checkOutTime = null;
            this._http.post(`${this.apiUrl}/undoCheckin`,_invite).subscribe()
            break;
          case "check out":
            index = this.getInviteIndex(_invite);
            this.invites[index].checkOutTime = null;
            this._http.post(`${this.apiUrl}/undoCheckout`,_invite).subscribe()
            break;
        }
      }
      
    })
  }


  getInviteIndex(invite: Invite):number {
    return this.invites.map( (_invite) => _invite.id).indexOf(invite.id);
  }

  applyFilter(filterValue: string) {
    console.log(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  dataSource = new MatTableDataSource(this.invites);

  getSheetInvites() {
    this._http.get(`${this.apiUrl}/invites`)
      .subscribe( (val: any) => {
        this.invites = val;
        this.dataSource = new MatTableDataSource(val);
      })
  }
}

interface Invite {
  inviteName: string,
  checkInTime: Date,
  checkOutTime: Date,
  isOver21: boolean,
  id: number
}