using MySqlConnector;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;

using static heyoushu.Models.RequiredModel.Heyoushu_Shared; // 共用

namespace heyoushu.Models.RequiredModel
{
    public class JwtBlackMiddleware
    {
        private const string AuthenticationHeader = "Authorization";
        private const string AuthenticationScheme = "Bearer";
        private const string LogoutHeader = "Logout";
        //private const int CacheExpiration = 2160; // 最大有效時間 36分鐘

        private readonly RequestDelegate _next;
        //private readonly IDistributedCache _cache;

        private readonly IWebHostEnvironment _env;

        public JwtBlackMiddleware(RequestDelegate next, IWebHostEnvironment env) // , IDistributedCache cache
        {
            _next = next;
            _env = env;
            //_cache = cache;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var auth = context.Request.Headers[AuthenticationHeader].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(auth) && auth.StartsWith(AuthenticationScheme))
            {
                var accessToken = auth[AuthenticationScheme.Length..].Trim();

                if (context.Request.Headers[LogoutHeader].FirstOrDefault() != null)
                {
                    if (CheckBlackToken(accessToken))
                    {
                        await context.Response.WriteAsync(JsonConvert.SerializeObject(new ReturnJson()
                        {
                            HttpCode = 401,
                            Message = "您沒有權限!"
                        }));

                        return;
                    }

                    var expiryDate = new JwtSecurityTokenHandler().ReadJwtToken(accessToken).ValidTo.AddHours(08); // 到期時間

                    await UserTokenShared.CreateBlackToken(accessToken, expiryDate);

                    // 方法2
                    //await _cache.SetStringAsync($"TokenBLK:{accessToken}", "1", new DistributedCacheEntryOptions
                    //{
                    //    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(CacheExpiration)
                    //});

                    context.Response.StatusCode = 200;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(JsonConvert.SerializeObject(new ReturnJson()
                    {
                        HttpCode = 200,
                        Message = "OK"
                    }));

                    return;
                }
                else
                {
                    if (CheckBlackToken(accessToken))
                    {
                        var path = context.Request.HttpContext.Request.Path;
                        var method = context.Request.HttpContext.Request.Method;
                        var ipAddress = context.Request.HttpContext.Connection.RemoteIpAddress?.ToString();

                        //CreateLog(accessToken, path, method, ipAddress ?? "");

                        context.Response.StatusCode = 200;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync(JsonConvert.SerializeObject(new ReturnJson()
                        {
                            HttpCode = 401,
                            Message = "您沒有權限!"
                        }));

                        return;
                    }

                    // 方法2
                    //if ((await _cache.GetStringAsync($"TokenBLK:{accessToken}")) != null)
                    //{
                    //    context.Response.StatusCode = 401;
                    //    return;
                    //}
                }
            }

            await _next(context);
        }

        private static bool CheckBlackToken(string accessToken)
        {
            bool tokenExists = false;
            using (var Connection = new MySqlConnection(ConfigurationManager.AppSetting[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand("Select Id From user_black_token Where (Token='" + accessToken + "')", Connection))
                {
                    Connection.Open();

                    var firstColumn = Command.ExecuteScalar();

                    if (firstColumn != null)
                        tokenExists = true;
                }
                Connection.Close();
            }

            return tokenExists;
        }

        private static readonly ReaderWriterLockSlim lock1 = new();

        private void CreateLog(string token, string path, string method, string ipAddress)
        {
            lock1.EnterWriteLock();
            try
            {
                if (!Directory.Exists(GetServerPath(@"\Log\XSS\")))
                    Directory.CreateDirectory(GetServerPath(@"\Log\XSS\"));

                if (ipAddress == "::1")
                    ipAddress = "127.0.0.1";

                string LogText = $"{DateTime.Now:yyyy/MM/dd HH:mm:ss}，路徑：{path}，Method：{method}，IP：{ipAddress}，Token：{token}\n";
                File.AppendAllTextAsync(GetServerPath(@"\Log\XSS\") + DateTime.Now.ToString("yyyyMMdd") + ".txt", LogText).Wait();
            }
            finally
            {
                lock1.ExitWriteLock();
            }
        }

        private string GetServerPath(string directoryName = "")
        {
            return _env.ContentRootPath + directoryName;
        }
    }
}
