
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  NotificationService,
  AppNotification
} from '../../services/notification.service';

@Component({
  selector: 'app-driver-dashboard',
  standalone:false,
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent
  implements OnInit, OnDestroy {

  notifications: AppNotification[] = [];
  private notificationSubscription?: Subscription;

  constructor(
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.notificationSubscription =
      this.notificationService.notifications$.subscribe(items => {
        this.notifications = items;
      });

    try {
      await this.notificationService.connect();
    } catch (error) {
      console.error('Notification connection failed:', error);
    }
  }

  markNotificationsRead(): void {
    this.notificationService.markAllAsRead();
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }
}
