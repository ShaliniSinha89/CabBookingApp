
import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import * as L from 'leaflet';
import { Subscription } from 'rxjs';

import {
  RideSignalrService,
  DriverLocation
} from '../../services/ride-signalr.service';

@Component({
  selector: 'app-ride-tracking',
  templateUrl: './ride-tracking.component.html',
  standalone:false,
  styleUrls: ['./ride-tracking.component.css']
})
export class RideTrackingComponent implements OnInit, OnDestroy {
  rideId = 1;
  driverId = 1;

  driverLocation?: DriverLocation;
  errorMessage = '';

  private locationSubscription?: Subscription;
  private map?: L.Map;
  private driverMarker?: L.Marker;

  constructor(private rideSignalr: RideSignalrService) {}

  async ngOnInit(): Promise<void> {
    this.initializeMap();

    this.locationSubscription =
      this.rideSignalr.driverLocation$.subscribe(location => {
        this.driverLocation = location;
        this.updateMapMarker(location.latitude, location.longitude);
      });

    try {
      await this.rideSignalr.startConnection();
      await this.rideSignalr.watchRide(this.rideId);
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.errorMessage =
        error instanceof Error ? error.message : String(error);
    }
  }

private createDriverIcon(): L.DivIcon {
  return L.divIcon({
    className: 'driver-parachute-icon',
    html: `
      <svg width="54" height="64" viewBox="0 0 54 64"
           xmlns="http://www.w3.org/2000/svg">
        <!-- Red parachute canopy -->
        <path d="M3 22
                 A24 19 0 0 1 51 22
                 Q39 31 27 22
                 Q15 31 3 22Z"
              fill="#e11d48" stroke="#9f1239" stroke-width="2"/>
        <!-- Suspension lines -->
        <path d="M3 22 L23 43 M27 22 L27 43 M51 22 L31 43"
              stroke="#475569" stroke-width="1.8" fill="none"/>
        <!-- Driver -->
        <circle cx="27" cy="44" r="5" fill="#fbbf24"
                stroke="#7c2d12" stroke-width="1.5"/>
        <path d="M27 49 L27 57 M27 51 L21 55 M27 51 L33 55
                 M27 57 L22 62 M27 57 L32 62"
              stroke="#1e293b" stroke-width="2.5"
              stroke-linecap="round" fill="none"/>
      </svg>`,
    iconSize: [54, 64],
    iconAnchor: [27, 62],
    popupAnchor: [0, -58]
  });
}

private initializeMap(): void {
  this.map = L.map('ride-map')
    .setView([28.6139, 77.2090], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(this.map);

  this.driverMarker = L.marker(
    [28.6139, 77.2090],
    { icon: this.createDriverIcon() }
  )
    .addTo(this.map)
    .bindPopup('Your driver is here');

  setTimeout(() => this.map?.invalidateSize(), 100);
}

private updateMapMarker(
  latitude: number,
  longitude: number
): void {
  if (!this.map || !this.driverMarker) {
    return;
  }

  const position: L.LatLngExpression = [
    latitude,
    longitude
  ];

  this.driverMarker.setLatLng(position);
  this.map.panTo(position);
}


  
private gpsWatchId?: number;

startGpsTracking(): void {
  if (!navigator.geolocation) {
    this.errorMessage = 'GPS is not supported by this browser.';
    return;
  }

  if (this.gpsWatchId !== undefined) {
    return;
  }

  this.gpsWatchId = navigator.geolocation.watchPosition(
    async position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        await this.rideSignalr.updateDriverLocation(
          this.rideId,
          this.driverId,
          latitude,
          longitude
        );

        console.log('GPS location sent:', latitude, longitude);
        this.errorMessage = '';
      } catch (error) {
        console.error('GPS update failed:', error);
        this.errorMessage =
          error instanceof Error ? error.message : String(error);
      }
    },
    error => {
      this.errorMessage = `GPS error: ${error.message}`;
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000
    }
  );
}

stopGpsTracking(): void {
  if (this.gpsWatchId !== undefined) {
    navigator.geolocation.clearWatch(this.gpsWatchId);
    this.gpsWatchId = undefined;
  }
}


  async sendTestLocation(): Promise<void> {
    try {
      await this.rideSignalr.updateDriverLocation(
        this.rideId,
        this.driverId,
        28.6139,
        77.2090
      );
      this.errorMessage = '';
    } catch (error) {
      console.error('Location update failed:', error);
      this.errorMessage =
        error instanceof Error ? error.message : String(error);
    }
  }

  ngOnDestroy(): void {
    this.locationSubscription?.unsubscribe();
    this.map?.remove();
  }
}
