using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CabBookingApp.Model
{
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string? FullName { get; set; }

        [Required, EmailAddress, MaxLength(150)]
        public string ? Email { get; set; }
        [Required]
        public string? PasswordHash { get; set; }
        [Required, MaxLength(15)]
        public string?  PhoneNumber { get; set; }
        [Required]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Driver? DriverProfile { get; set; }
        public ICollection<Ride> RidesAsRider { get; set; } = new List<Ride>();
        public ICollection<Notification> NotiFications { get; set; } = new List<Notification>();


        public enum UserRole
        {
            Rider,
            Driver
        }
    }
}
