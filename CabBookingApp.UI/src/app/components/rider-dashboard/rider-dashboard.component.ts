
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotification } from '../../services/notification.service';
import {
  RideService,
  CreateRideDto
} from '../../services/ride.service';

@Component({
  selector: 'app-rider-dashboard',
  standalone: false,
  templateUrl: './rider-dashboard.component.html',
  styleUrl: './rider-dashboard.component.css'
})
export class RiderDashboardComponent implements OnInit {

  pickupAddress = '';
  dropAddress = '';

  pickUpLatitude: number | null = null;
  pickUpLongitude: number | null = null;
  dropLatitude: number | null = null;
  dropLongitude: number | null = null;
  rideId: number | null = null;
  loading = false;
  message = '';
  notifications: AppNotification[] = [];

  // Obtain this from your actual login/authentication service.
  riderId: number | null = null;

  constructor(private rideService: RideService) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      this.message = 'Please sign in as a rider before booking.';
      return;
    }

    try {
      const user: unknown = JSON.parse(storedUser);
      if (
        typeof user === 'object' &&
        user !== null &&
        'id' in user &&
        'role' in user &&
        Number.isFinite(Number(user.id)) &&
        String(user.role).toLowerCase() === 'rider'
      ) {
        this.riderId = Number(user.id);
        this.message = '';
      } else {
        this.message = 'Please sign in with a rider account.';
      }
    } catch {
      this.message = 'Unable to read user information. Please sign in again.';
    }
  }

  bookRide(): void {
    this.message = '';

    if (!this.pickupAddress.trim() ||
        !this.dropAddress.trim()) {
      this.message = 'Please enter both addresses.';
      return;
    }

    if (
      this.pickUpLatitude === null ||
      this.pickUpLongitude === null ||
      this.dropLatitude === null ||
      this.dropLongitude === null
    ) {
      this.message = 'Please provide pickup and destination coordinates.';
      return;
    }

    if (this.riderId === null) {
      this.message =
        'Please sign in as a rider before booking.';
      return;
    }

    const dto: CreateRideDto = {
      riderId: this.riderId,
      pickUpAddress: this.pickupAddress.trim(),
      dropAddress: this.dropAddress.trim(),
      pickUpLatitude: this.pickUpLatitude,
      pickUpLongitude: this.pickUpLongitude,
      dropLatitude: this.dropLatitude,
      dropLongitude: this.dropLongitude
    };

    this.loading = true;
    this.message = 'Booking your cab...';

    this.rideService.createRide(dto).subscribe({
      next: (ride) => {
        this.rideId = ride.id;
        this.message = `Cab booked successfully! Ride ID: ${ride.id}`;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        this.message =
          typeof error.error === 'string'
            ? error.error
            : error.status === 0
              ? 'Cannot connect to the API. Check the API URL and CORS settings.'
              : `Booking failed (${error.status}). ${error.message}`;
      }
    });
  }

  trackRide(): void {
    if (this.rideId !== null) {
      // Navigate to your live tracking route using this ride ID.
    }
  }

  getMyLocation(): void {
    if (!navigator.geolocation) {
      this.message = 'Geolocation is not supported by this browser.';
      return;
    }

    this.message = 'Getting your current location...';

    navigator.geolocation.getCurrentPosition(
      position => {
        this.pickUpLatitude = position.coords.latitude;
        this.pickUpLongitude = position.coords.longitude;

        if (!this.pickupAddress.trim()) {
          this.pickupAddress = 'My current location';
        }

        this.message = 'Pickup coordinates filled successfully!';
      },
      error => {
        this.message =
          error.code === error.PERMISSION_DENIED
            ? 'Please allow location access in your browser.'
            : error.code === error.TIMEOUT
              ? 'Location request timed out. Please try again.'
              : 'Unable to get your location.';
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }
}
