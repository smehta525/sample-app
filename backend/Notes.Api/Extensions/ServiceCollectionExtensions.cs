using Microsoft.EntityFrameworkCore;

using Notes.Api.Data;

namespace Notes.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"] ?? "Sqlite";

        services.AddDbContext<NotesDbContext>(options =>
        {
            switch (provider)
            {
                case "SqlServer":
                    options.UseSqlServer(configuration.GetConnectionString("SqlServer"));
                    break;
                case "Sqlite":
                default:
                    options.UseSqlite(configuration.GetConnectionString("Sqlite"));
                    break;
            }

            options.ReplaceService<Microsoft.EntityFrameworkCore.Migrations.IMigrationsAssembly, ProviderNamespacedMigrationsAssembly>();
        });

        return services;
    }
}