using System.ComponentModel.DataAnnotations;

namespace CabBookingApp.DTO
{
    public class CreateRideDto
    {
        [Required]
        public int RiderId { get; set; }

        [Range(-180, 180)]
        public double PickUpLongitude { get; set; }

        [Range(-90, 90)]
        public double PickUpLatitude { get; set; }

        [Range(-90, 90)]
        public double DropLatitude { get; set; }

        [Range(-180, 180)]
        public double DropLongitude { get; set; }

        [Required]
        public string PickUpAddress { get; set; } = string.Empty;

        [Required]
        public string DropAddress { get; set; } = string.Empty;
    }

}

