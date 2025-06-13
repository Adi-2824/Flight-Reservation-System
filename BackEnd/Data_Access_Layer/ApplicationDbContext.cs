using air_reservation.Models.Flight_Model_;
using air_reservation.Models.Passenger_Model_;
using air_reservation.Models.Payment_Model_;
using air_reservation.Models.Registration_Model_;
using air_reservation.Models.Reservation_Model_;
using air_reservation.Models.Users_Model_;
using Microsoft.EntityFrameworkCore;

namespace air_reservation.Data_Access_Layer
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<LoginModel> LoginLogs { get; set; }
        public DbSet<RegisterModel> RegistrationLogs { get; set; }
        public DbSet<Flight> Flights { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Passenger> Passengers { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Role).HasDefaultValue(UserRole.User);
            });

            // LoginModel Configuration
            modelBuilder.Entity<LoginModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
            });

            // RegisterModel Configuration
            modelBuilder.Entity<RegisterModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.VerificationToken).HasMaxLength(100);
                entity.Property(e => e.Role).HasDefaultValue(UserRole.User);
            });

            // Flight Configuration
            modelBuilder.Entity<Flight>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FlightNumber).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Airline).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Origin).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Destination).IsRequired().HasMaxLength(50);
                entity.Property(e => e.EconomyPrice).HasColumnType("decimal(10,2)");
                entity.Property(e => e.BusinessPrice).HasColumnType("decimal(10,2)");
            });

            // Reservation Configuration
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BookingReference).IsRequired().HasMaxLength(20);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(10,2)");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Reservations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Flight)
                    .WithMany(f => f.Reservations)
                    .HasForeignKey(e => e.FlightId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Passenger Configuration
            modelBuilder.Entity<Passenger>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);

                entity.HasOne(e => e.Reservation)
                    .WithMany(r => r.Passengers)
                    .HasForeignKey(e => e.ReservationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(10,2)");
                entity.Property(e => e.TransactionId).HasMaxLength(100);

                entity.HasOne(e => e.Reservation)
                    .WithOne(r => r.Payment)
                    .HasForeignKey<Payment>(e => e.ReservationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            FlightSeeding.Seed(modelBuilder);

            // Seed Data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Admin User
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Email = "aster@gmail.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("aster07"),
                    FirstName = "Aster",
                    LastName = "Admin",
                    PhoneNumber = "+1234567890",
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow
                }
            );

            
        
            
        }
    }
}
