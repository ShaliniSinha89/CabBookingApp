using CabBooking.API.Hubs;
using CabBookingApp.Data;
using CabBookingApp.DTO;
using CabBookingApp.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace CabBookingApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class RidesController : ControllerBase
    {
        private readonly CabDbContext _context;
        private readonly IHubContext<RideHub> _hubContext;
        public RidesController(CabDbContext context, IHubContext<RideHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }
        [HttpGet]
        [Authorize(Roles = "Rider")]
        public async Task<IActionResult>GetRides()
        {
            var rides = await _context.Rides.AsNoTracking().ToListAsync();
            return Ok(rides);
        }
        [HttpGet("{id:int}")]
        public async Task<IActionResult>GetRides(int id)
        {
            var rides = await _context.Rides.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (rides == null)
                return NotFound();
            return Ok(rides);

        }

        [HttpPost]
        [Authorize(Roles = "Rider")]
        public async Task<IActionResult> CreateRide(CreateRideDto dto)
        {
            // 1. Get the logged-in rider's ID from the JWT token
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var riderId))
            {
                return Unauthorized(new
                {
                    message = "Invalid rider identity in token."
                });
            }

            // 2. Verify the rider exists
            var riderExists = await _context.Users.AnyAsync(u =>
                u.Id == riderId &&
                u.Role == CabBookingApp.Model.User.UserRole.Rider);

            if (!riderExists)
            {
                return Unauthorized(new
                {
                    message = "Rider account not found."
                });
            }

            // 3. Create the ride
            var ride = new Ride
            {
                RiderId = riderId,
                PickUpLongitute = dto.PickUpLongitude,
                PickUpLatitude = dto.PickUpLatitude,
                DropLatitude = dto.DropLatitude,
                DropLongitude = dto.DropLongitude,
                PickUpAddress = dto.PickUpAddress,
                DropAddress = dto.DropAddress,
                Status = RideStatus.Pending,
                Fare = 0
            };

            // 4. Save the ride
            _context.Rides.Add(ride);
            await _context.SaveChangesAsync();

            // 5. Return the created ride
            return Ok(new
            {
                message = "Ride created successfully.",
                rideId = ride.Id,
                riderId = ride.RiderId,
                status = ride.Status,
                pickupAddress = ride.PickUpAddress,
                dropAddress = ride.DropAddress
            });
        }


        [HttpPut("{id:int}/assign-driver")]
        public async Task<IActionResult> AssignDriver(
            int id,
            AssignDriverDto dto)
        {
            // Find the ride
            var ride = await _context.Rides
                .FirstOrDefaultAsync(r => r.Id == id);

            if (ride == null)
                return NotFound("Ride not found.");

            if (ride.Status != RideStatus.Pending)
                return BadRequest("Only pending rides can be assigned.");

            // Find the driver and load their user details
            var driver = await _context.Drivers
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == dto.DriverId);

            if (driver == null)
                return NotFound("Driver not found.");

            if (!driver.IsAvailable)
                return BadRequest("Driver is not available.");

            // Update the Ride
            ride.DriverId = driver.Id;
            ride.Status = RideStatus.Accepted;

            // Update the Driver
            driver.IsAvailable = false;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ride.Id,
                ride.RiderId,
                ride.DriverId,
                ride.Status,
                DriverName = driver.User.FullName,
                driver.VehicleModel,
                driver.LicensePlate
            });
        }

        [HttpPut("{id:int}/start")]
        public async Task<IActionResult> StartRide(int id)
        {
            var ride = await _context.Rides
                .FirstOrDefaultAsync(r => r.Id == id);

            if (ride == null)
                return NotFound("Ride not found.");

            if (ride.Status != RideStatus.Accepted)
                return BadRequest(
                    "Only accepted rides can be started.");

            ride.Status = RideStatus.PickedUp;
            ride.StartedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ride.Id,
                ride.RiderId,
                ride.DriverId,
                ride.Status,
                ride.StartedAt
            });
        }

        [HttpPut("{id:int}/complete")]
        public async Task<IActionResult> CompleteRide(int id)
        {
            var ride = await _context.Rides
                .FirstOrDefaultAsync(r => r.Id == id);

            if (ride == null)
                return NotFound("Ride not found.");

            if (ride.Status != RideStatus.PickedUp)
                return BadRequest(
                    "Only picked-up rides can be completed.");

            ride.Status = RideStatus.Completed;
            ride.CompletedAt = DateTime.UtcNow;

            var driver = await _context.Drivers
                .FirstOrDefaultAsync(d => d.Id == ride.DriverId);

            if (driver != null)
            {
                driver.IsAvailable = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ride.Id,
                ride.RiderId,
                ride.DriverId,
                ride.Status,
                ride.StartedAt,
                ride.CompletedAt
            });
        }



      


    }
}
