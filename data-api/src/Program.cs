// -----------------------------------------------------------------------
// KRConnects Data API
// The ONLY service that talks to the database. Other services (auth-api,
// later orders) call this API instead of connecting to SQL Server directly.
//
// Connection string comes from configuration key "ConnectionStrings:DataDb".
// In Kubernetes it is injected as the environment variable
//   ConnectionStrings__DataDb   (from a Kubernetes Secret)
// It is NEVER stored in appsettings.json (public repo).
// -----------------------------------------------------------------------

using DataApi.Data;
using DataApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Read the connection string (fail fast with a clear message if missing)
string? connectionString = builder.Configuration.GetConnectionString("DataDb");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'DataDb' is missing. Set the environment variable 'ConnectionStrings__DataDb'.");
}

// 2. Register services
builder.Services.AddControllers();
builder.Services.AddDbContext<DataDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<UserService>();

var app = builder.Build();

// 3. Create the database and tables if they don't exist yet.
//    SQL Server may still be starting, so retry a few times before giving up.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DataDbContext>();

    for (int attempt = 1; attempt <= 10; attempt++)
    {
        try
        {
            db.Database.EnsureCreated();
            app.Logger.LogInformation("Database is ready.");
            break;
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning("Database not ready (attempt {Attempt}/10): {Error}", attempt, ex.Message);

            if (attempt == 10)
            {
                throw;   // give up: the pod restarts and tries again
            }

            Thread.Sleep(TimeSpan.FromSeconds(5));
        }
    }
}

// 4. Endpoints
app.MapControllers();

// GET / - shows which app this is
app.MapGet("/", () => Results.Ok(new
{
    message = "This is the KRConnects Data API — responsible for database CRUD operations.",
    service = "krconnects-data-api",
    timestamp = DateTime.UtcNow.ToString("o")
}));

app.Run();
