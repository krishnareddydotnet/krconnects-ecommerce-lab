using DataApi.Data;
using DataApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DataApi.Services;

/// <summary>
/// All database logic (CRUD) for products lives here.
/// </summary>
public class ProductService
{
    private readonly DataDbContext _db;

    public ProductService(DataDbContext db)
    {
        _db = db;
    }

    // READ: all products, optionally filtered by a search text (name or category)
    public async Task<List<Product>> GetAllAsync(string? search)
    {
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            string text = search.Trim();
            query = query.Where(p => p.Name.Contains(text) || p.Category.Contains(text));
        }

        return await query.OrderBy(p => p.Id).ToListAsync();
    }

    // READ: one product by id (null if not found)
    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _db.Products.FindAsync(id);
    }

    // CREATE
    public async Task<Product> CreateAsync(ProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name.Trim(),
            Category = request.Category.Trim(),
            Price = request.Price
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();   // INSERT happens here
        return product;
    }

    // UPDATE (false if not found)
    public async Task<bool> UpdateAsync(int id, ProductRequest request)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
        {
            return false;
        }

        product.Name = request.Name.Trim();
        product.Category = request.Category.Trim();
        product.Price = request.Price;

        await _db.SaveChangesAsync();   // UPDATE happens here
        return true;
    }

    // DELETE (false if not found)
    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
        {
            return false;
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();   // DELETE happens here
        return true;
    }
}
