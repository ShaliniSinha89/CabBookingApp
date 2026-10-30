using System.ComponentModel.DataAnnotations;

namespace CabBookingApp.DTO
{
    public class AssignDriverDto
    {
        [Required]
        public int DriverId { get; set; }
    }
}
