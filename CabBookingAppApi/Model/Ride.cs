using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CabBookingApp.Model
{
    public class Ride
    {
        public int Id { get; set; }
        [Required]
        public int RiderId { get; set; }
        [ForeignKey("RiderId")]
        public User? Rider { get; set; }
        public int? DriverId { get; set; }
        [ForeignKey("DriverId")]
        public Driver? Driver { get; set; }
        [Required]
        public double PickUpLongitute { get; set; }
        [Required]
        public double PickUpLatitude { get; set; }
        [Required]
        public double DropLatitude { get; set; }
        [Required]
        public double DropLongitude { get; set; }
        [Required]
        public string? PickUpAddress { get; set; }
        [Required]
        public string? DropAddress { get; set; }
        [Required]
        public RideStatus Status { get; set; } = RideStatus.Pending;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Fare { get; set; }
        public string TrackingToken { get; set; } = Guid.NewGuid().ToString("N");
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }



    }
    public enum RideStatus
    {
        Pending,
        Accepted,
        PickedUp,
        Completed,
        Cancelled
    }
}
