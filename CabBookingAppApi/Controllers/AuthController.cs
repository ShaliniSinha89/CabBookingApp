
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CabBookingApp.DTOs;
using CabBookingApp.Data;
using AppUser = CabBookingApp.Model.User;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CabBookingApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CabDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            CabDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var existingUser = await _context.Users
                .AnyAsync(u => u.Email != null &&
                               u.Email.ToLower() == email);

            if (existingUser)
            {
                return Conflict(new
                {
                    message = "An account with this email already exists."
                });
            }

            var user = new AppUser
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                PhoneNumber = dto.PhoneNumber.Trim(),
                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = AppUser.UserRole.Rider
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "Registration successful. Please log in.",
                userId = user.Id
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email != null &&
                    u.Email.ToLower() == email);

            //if (user == null ||
            //    string.IsNullOrWhiteSpace(user.PasswordHash) ||
            //    !BCrypt.Net.BCrypt.Verify(
            //        dto.Password,
            //        user.PasswordHash))
            //{
            //    return Unauthorized(new
            //    {
            //        message = "Invalid email or password."
            //    });
            //}
            string hash = BCrypt.Net.BCrypt.HashPassword("Rider@123");
            Console.WriteLine(hash);
            Console.WriteLine(hash.Length);
            var keyText = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(keyText) ||
                string.IsNullOrWhiteSpace(issuer) ||
                string.IsNullOrWhiteSpace(audience))
            {
                return StatusCode(500, new
                {
                    message = "JWT configuration is missing."
                });
            }

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    user.FullName ?? string.Empty),

                new Claim(
                    ClaimTypes.Email,
                    user.Email ?? string.Empty),

                new Claim(
                    ClaimTypes.Role,
                    user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(keyText));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddHours(2);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            var tokenString =
                new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                expiresAt = expires,
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role.ToString()
            });
        }
    }
}
