using DataApi.Data;
using DataApi.Models;
using DataApi.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DataApi.Tests;

/// <summary>
/// Tests the product CRUD logic using an in-memory database.
/// </summary>
public class ProductServiceTests
{
    // Creates a service with a fresh database that already has the 100 demo products
    private static ProductService CreateServiceWithSeedData()
    {
        var options = new DbContextOptionsBuilder<DataDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var db = new DataDbContext(options);
        db.Products.AddRange(ProductSeedData.GetProducts());
        db.SaveChanges();

        return new ProductService(db);
    }

    [Fact]
    public void SeedData_Has100Products()
    {
        Assert.Equal(100, ProductSeedData.GetProducts().Count);
    }

    [Fact]
    public async Task GetAll_NoSearch_Returns100Products()
    {
        var service = CreateServiceWithSeedData();

        var products = await service.GetAllAsync(null);

        Assert.Equal(100, products.Count);
    }

    [Fact]
    public async Task GetAll_SearchByCategory_ReturnsOnlyMatches()
    {
        var service = CreateServiceWithSeedData();

        var products = await service.GetAllAsync("Clothing");

        Assert.Equal(10, products.Count);
        Assert.All(products, p => Assert.Equal("Clothing", p.Category));
    }

    [Fact]
    public async Task Create_AddsProduct()
    {
        var service = CreateServiceWithSeedData();

        var created = await service.CreateAsync(new ProductRequest { Name = "Laptop Stand", Category = "Office", Price = 999m });
        var found = await service.GetByIdAsync(created.Id);

        Assert.NotNull(found);
        Assert.Equal("Laptop Stand", found!.Name);
    }

    [Fact]
    public async Task Update_ChangesPrice()
    {
        var service = CreateServiceWithSeedData();

        bool updated = await service.UpdateAsync(1, new ProductRequest { Name = "Wireless Mouse", Category = "Electronics", Price = 1299m });
        var product = await service.GetByIdAsync(1);

        Assert.True(updated);
        Assert.Equal(1299m, product!.Price);
    }

    [Fact]
    public async Task Delete_UnknownId_ReturnsFalse()
    {
        var service = CreateServiceWithSeedData();

        bool deleted = await service.DeleteAsync(9999);

        Assert.False(deleted);
    }
}
