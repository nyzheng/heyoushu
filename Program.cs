using Microsoft.AspNetCore.Mvc.Authorization;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor(); // 取得使用者資訊

// 跨域處理
var corsOptions = builder.Configuration.GetSection("Cors").Get<CorsOptions>();
string[] corsOrigins = corsOptions.AllowOrigin.Split(",", StringSplitOptions.RemoveEmptyEntries);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins.Contains("*"))
            policy.SetIsOriginAllowed(_ => true);
        else
            policy.WithOrigins(corsOrigins);

        policy.AllowAnyMethod();
        policy.AllowAnyHeader();
        policy.AllowCredentials();
    });
});
// 跨域處理 End

//// 身份驗證 Start
//var JwtOptions = builder.Configuration.GetSection("JWT").Get<JWTOptions>();
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(Options =>
//{
//    Options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = true,
//        ValidIssuer = JwtOptions.Issuer,
//        ValidateAudience = true,
//        ValidAudience = JwtOptions.Audience,
//        ValidateLifetime = true,
//        ClockSkew = TimeSpan.Zero,
//        ValidateIssuerSigningKey = true,
//        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtOptions.Secret))
//    };
//});
//builder.Services.AddAuthorization();

//builder.Services.AddMvc(options =>
//{
//    options.Filters.Add(new AuthorizeFilter()); // 身份驗證
//    //options.Filters.Add(typeof(LogActionFilter)); // Log 紀錄
//    options.Filters.Add(typeof(ResultFilter)); // Result 統一回傳格式
//});
//// 身份驗證 End

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null); // JSON 格式大小寫不變

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors(); // 跨域處理
app.UseMiddleware<JwtBlackMiddleware>(); // 身份驗證 黑名單
//app.UseAuthentication(); // 身份驗證
app.UseAuthorization(); // 身份驗證

app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
