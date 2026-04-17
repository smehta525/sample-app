using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Notes.Api.Data;

public sealed class NotesDbContextFactory : IDesignTimeDbContextFactory<NotesDbContext>
{
    public NotesDbContext CreateDbContext(string[] args)
    {
        var provider = ParseProvider(args) ?? "Sqlite";
        var builder = new DbContextOptionsBuilder<NotesDbContext>();

        switch (provider)
        {
            case "SqlServer":
                builder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=Notes;Trusted_Connection=True;");
                break;
            case "Sqlite":
            default:
                builder.UseSqlite("Data Source=notes.db");
                break;
        }

        builder.ReplaceService<Microsoft.EntityFrameworkCore.Migrations.IMigrationsAssembly, ProviderNamespacedMigrationsAssembly>();

        return new NotesDbContext(builder.Options);
    }

    private static string? ParseProvider(string[] args)
    {
        for (var i = 0; i < args.Length - 1; i++)
        {
            if (string.Equals(args[i], "--provider", StringComparison.OrdinalIgnoreCase))
            {
                return args[i + 1];
            }
        }

        return Environment.GetEnvironmentVariable("DATABASE_PROVIDER");
    }
}