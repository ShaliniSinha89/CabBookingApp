using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CabBookingApp.Model
{
    public class Notification
    {
            public int Id { get; set; }

            [Required]
            public int UserId { get; set; }

            [ForeignKey("UserId")]
            public User User { get; set; } = null!;

            [Required, MaxLength(100)]
            public string Title { get; set; } = string.Empty;

        [Required, MaxLength(250)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
