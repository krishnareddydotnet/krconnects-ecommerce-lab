// -----------------------------------------------------------------------
// KRConnects Auth API
// Responsible for authentication and identity management.
//
// NOTE (interview-prep / learning scope):
// This sample intentionally does NOT connect to a real database or a real
// Azure Key Vault. In a production KRConnects deployment:
//   - appsettings.json would hold only the Key Vault URI (not secrets).
//   - The app would call builder.Configuration.AddAzureKeyVault(...) using
//     DefaultAzureCredential (Workload Identity Federation in AKS) to pull
//     real secrets such as "AuthApi-AzureSql-ConnectionString" at startup.
//   - This sample instead uses a simulated in-memory dependency check.
// -----------------------------------------------------------------------

using AuthApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IAuthInfoService, AuthInfoService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

// GET / - simple root identifier so hitting the base URL immediately
// shows which app this is, without needing to know a specific route.
app.MapGet("/", () => Results.Ok(new
{
    message = "This is the KRConnects Auth API.",
    service = "krconnects-auth-api",
    timestamp = DateTime.UtcNow.ToString("o")
}));

app.Run();

// Exposes Program for WebApplicationFactory-based integration tests.
public partial class Program { }
