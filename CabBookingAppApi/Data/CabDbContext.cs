using CabBookingApp.Model;
using Microsoft.EntityFrameworkCore;

namespace CabBookingApp.Data
{
    public class CabDbContext : DbContext
    {
        public CabDbContext(DbContextOptions<CabDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Ride> Rides { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Ride Relationship constraints to prevent cascading cycles
            modelBuilder.Entity<Ride>()
     .HasOne(r => r.Rider)
     .WithMany(u => u.RidesAsRider)
     .HasForeignKey(r => r.RiderId)
     .OnDelete(DeleteBehavior.Restrict); // Keep it exactly like this

            modelBuilder.Entity<Ride>()
                .HasOne(r => r.Driver)
                .WithMany(d => d.RidesAsDriver)
                .HasForeignKey(r => r.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Performance Tuning Index: Speeds up geo-coordinate scans for nearby drivers
            modelBuilder.Entity<Driver>()
                .HasIndex(d => new { d.IsAvailable, d.CurrentLatitude, d.CurrentLongitude })
                .HasDatabaseName("IX_Drivers_GeoLocation");

            // Performance Tuning Index: Optimizes secure token validation queries
            modelBuilder.Entity<Ride>()
                  .HasIndex(r => r.TrackingToken)
                .IsUnique();
        }
    }
}
