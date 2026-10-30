using Microsoft.AspNetCore.Routing.Constraints;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CabBookingApp.Model
{
    public class Driver
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [Required, MaxLength(50)]
        public string VehicleModel { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string LicensePlate { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = false;

        // Ephemeral Geolocation Coordinates
        public double CurrentLatitude { get; set; }
        public double CurrentLongitude { get; set; }
        public DateTime LastLocationUpdate { get; set; } = DateTime.UtcNow;

        public ICollection<Ride> RidesAsDriver { get; set; } = new List<Ride>();
    }
}
