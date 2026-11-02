
import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState
} from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection?: HubConnection;

  private notificationsSubject =
    new BehaviorSubject<AppNotification[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  async connect(): Promise<void> {
    if (!this.hubConnection) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl('https://localhost:7276/ridehub')
        .withAutomaticReconnect()
        .build();

      this.hubConnection.on(
        'ReceiveNotification',
        (notification: AppNotification) => {
          this.notificationsSubject.next([
            notification,
            ...this.notificationsSubject.value
          ]);
        }
      );
    }

    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      await this.hubConnection.start();

      // Join the group that receives new ride requests.
      await this.hubConnection.invoke('JoinAvailableRides');
      console.log('Connected and joined available-drivers group.');
    }
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
  }

  markAllAsRead(): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n => ({
        ...n,
        isRead: true
      }))
    );
  }
}
