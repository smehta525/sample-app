using System.Reflection;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Internal;

namespace Notes.Api.Data;

#pragma warning disable EF1001 // Intentional: only way to filter migrations by namespace

/// <summary>
/// Filters discovered migrations / model snapshot by namespace so that a single
/// DbContext in a single assembly can host migrations for multiple providers
/// (Migrations/Sqlite vs Migrations/SqlServer).
/// </summary>
public sealed class ProviderNamespacedMigrationsAssembly(
    ICurrentDbContext currentContext,
    IDbContextOptions options,
    IMigrationsIdGenerator idGenerator,
    IDiagnosticsLogger<DbLoggerCategory.Migrations> logger)
    : MigrationsAssembly(currentContext, options, idGenerator, logger)
{
    private readonly DbContext _context = currentContext.Context;

    private string ProviderSegment =>
        _context.Database.ProviderName switch
        {
            "Microsoft.EntityFrameworkCore.Sqlite" => ".Migrations.Sqlite",
            "Microsoft.EntityFrameworkCore.SqlServer" => ".Migrations.SqlServer",
            _ => string.Empty
        };

    public override IReadOnlyDictionary<string, TypeInfo> Migrations
    {
        get
        {
            var segment = ProviderSegment;
            if (string.IsNullOrEmpty(segment))
            {
                return base.Migrations;
            }

            return base.Migrations
                .Where(m => m.Value.Namespace is { } ns && ns.Contains(segment, StringComparison.Ordinal))
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }
    }

    public override ModelSnapshot? ModelSnapshot
    {
        get
        {
            var segment = ProviderSegment;
            if (string.IsNullOrEmpty(segment))
            {
                return base.ModelSnapshot;
            }

            var snapshotType = Assembly
                .GetTypes()
                .FirstOrDefault(t =>
                    t.IsSubclassOf(typeof(ModelSnapshot))
                    && t.Namespace is { } ns
                    && ns.Contains(segment, StringComparison.Ordinal));

            return snapshotType is null ? null : (ModelSnapshot?)Activator.CreateInstance(snapshotType);
        }
    }
}

#pragma warning restore EF1001