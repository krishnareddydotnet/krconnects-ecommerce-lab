using DataApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DataApi.Data;

/// <summary>
/// EF Core "DbContext" = the connection between our C# classes and the database.
/// Each DbSet becomes a table.
/// </summary>
public class DataDbContext : DbContext
{
    public DataDbContext(DbContextOptions<DataDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Username: required, max 50 characters, and UNIQUE (no duplicate usernames)
        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }
}
