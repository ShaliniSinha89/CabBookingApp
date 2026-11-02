
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateRideDto {
  riderId: number;
  pickUpAddress: string;
  dropAddress: string;
  pickUpLatitude: number;
  pickUpLongitude: number;
  dropLatitude: number;
  dropLongitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private readonly apiUrl = 'https://localhost:44369/api/Rides';

  constructor(private http: HttpClient) {}

  createRide(dto: CreateRideDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }
}

