using Microsoft.Extensions.Configuration;

namespace IT.Api.Helpers;

public class DatabaseHelpers(IConfiguration configuration)
{
    public string GetDefaultConnection()
    {
        return configuration.GetConnectionString("DefaultConnection");
    }
}
