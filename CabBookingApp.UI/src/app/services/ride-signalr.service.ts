
import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr';
import { Subject } from 'rxjs';

export interface DriverLocation {
  rideId: number;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideSignalrService {
  private hubConnection?: HubConnection;

  private locationSubject = new Subject<DriverLocation>();
  driverLocation$ = this.locationSubject.asObservable();

  async startConnection(): Promise<void> {
    if (
      this.hubConnection?.state === HubConnectionState.Connected
    ) {
      return;
    }

    if (this.hubConnection?.state === HubConnectionState.Connecting) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:44369/ridehub')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.on(
      'DriverLocationChanged',
      (location: DriverLocation) => {
        this.locationSubject.next(location);
      }
    );

    await this.hubConnection.start();
    console.log('Connected to RideHub!');
  }

  async watchRide(rideId: number): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      throw new Error('SignalR is not connected.');
    }

    await this.hubConnection.invoke('WatchRide', rideId);
    console.log(`Watching ride ${rideId}`);
  }

  async updateDriverLocation(
    rideId: number,
    driverId: number,
    latitude: number,
    longitude: number
  ): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      throw new Error('SignalR is not connected.');
    }

    await this.hubConnection.invoke(
      'UpdateDriverLocation',
      rideId,
      driverId,
      latitude,
      longitude
    );
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = undefined;
    }
  }
}
