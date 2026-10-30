
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CabBookingApp.Model;
using CabBookingApp.Data;

namespace CabBooking.API.Hubs
{
    public class RideHub : Hub
    {
        private readonly CabDbContext _context;

        public RideHub(CabDbContext context)
        {
            _context = context;
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                groupName);
        }

        public async Task JoinAvailableRides()
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                "available-drivers"
            );
        }
        public async Task WatchRide(int rideId)
        {
            Console.WriteLine($"WatchRide called for ride {rideId}");

            var ride = await _context.Rides
                .FirstOrDefaultAsync(r => r.Id == rideId);

            if (ride == null)
            {
                Console.WriteLine("Ride not found.");
                throw new HubException("Ride not found.");
            }

            Console.WriteLine(
                $"Ride found. Status: {ride.Status}, DriverId: {ride.DriverId}");

            if (ride.Status != RideStatus.Accepted &&
                ride.Status != RideStatus.PickedUp)
            {
                Console.WriteLine("Ride is not active.");
                throw new HubException("This ride is not active.");
            }

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Ride_{rideId}");

            Console.WriteLine($"Connection joined Ride_{rideId}");
        }


        public async Task UpdateDriverLocation(
            int rideId,
            int driverId,
            double latitude,
            double longitude)
        {
            if (latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180)
            {
                throw new HubException("Invalid coordinates.");
            }

            var ride = await _context.Rides
                .FirstOrDefaultAsync(r => r.Id == rideId);

            if (ride == null)
                throw new HubException("Ride not found.");

            if (ride.DriverId != driverId)
                throw new HubException(
                    "Driver is not assigned to this ride.");

            if (ride.Status != RideStatus.Accepted &&
                ride.Status != RideStatus.PickedUp)
            {
                throw new HubException(
                    "Location updates are not allowed for this ride.");
            }

            var driver = await _context.Drivers
                .FirstOrDefaultAsync(d => d.Id == driverId);

            if (driver == null)
                throw new HubException("Driver not found.");

            driver.CurrentLatitude = latitude;
            driver.CurrentLongitude = longitude;
            driver.LastLocationUpdate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await Clients.Group($"Ride_{rideId}")
                .SendAsync("DriverLocationChanged", new
                {
                    rideId,
                    latitude,
                    longitude,
                    updatedAt = driver.LastLocationUpdate
                });
        }

    }
}
        