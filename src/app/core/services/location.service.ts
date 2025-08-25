import { Injectable, inject, signal } from '@angular/core';



@Injectable({ providedIn: 'root' })
export class LocationService {
 readonly isLocationEnabled = signal(false);
 readonly isCheckingLocation = signal(true);
  loadGeolocation(){
    navigator.geolocation.watchPosition(this.successFunc.bind(this), this.errorFunc.bind(this));
    this.isCheckingLocation.set(false);
  }
  successFunc(position: any){
   console.log(position.coords.latitude, position.coords.longitude);
   if(position.coords.latitude === 11.537869 && position.coords.longitude === 79.3296565){
        this.isLocationEnabled.set(true);
   }
  }
  errorFunc(error: any){
    console.error('Geolocation error:', error);
  }
}