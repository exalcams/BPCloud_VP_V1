import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { BPCOFHeader, Notification } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-expenditor-dashboard',
  templateUrl: './expenditor-dashboard.component.html',
  styleUrls: ['./expenditor-dashboard.component.scss']
})
export class ExpenditorDashboardComponent implements OnInit {
  IsProgressBarVisibile = false;
  ExpenditorListDataSource: MatTableDataSource<Notification>;
  NotificationList: Notification[];
  ExpenditorDisplayedColumns = ["S.No", "PatnerID", "PO", "Status", "POType", "AfterDunning1", "AfterDunning2", "AfterDunning3", "IsAllCompleted", "LastRespondedOn"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _authService: AuthService) {
    this.ExpenditorListDataSource = new MatTableDataSource<Notification>();
    this.NotificationList = [];
  }

  ngOnInit(): void { 
    this.GetNotificationList();
  }
  GetNotificationList(): void {
    this.IsProgressBarVisibile = true;
    this._authService.GetExpenditorNotification().subscribe(
      (data) => {
        this.NotificationList = data as Notification[];
        this.ExpenditorListDataSource = new MatTableDataSource<Notification>(this.NotificationList);
        this.ExpenditorListDataSource.paginator = this.paginator;
        this.ExpenditorListDataSource.sort = this.sort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
}
