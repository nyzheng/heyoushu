using Microsoft.AspNetCore.Mvc.Authorization;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor(); // ���o�ϥΪ̸�T

// ���B�z
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
// ���B�z End

//// �������� Start
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
//    options.Filters.Add(new AuthorizeFilter()); // ��������
//    //options.Filters.Add(typeof(LogActionFilter)); // Log ����
//    options.Filters.Add(typeof(ResultFilter)); // Result �Τ@�^�Ǯ榡
//});
//// �������� End

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null); // JSON �榡�j�p�g����

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

app.UseCors(); // ���B�z
app.UseMiddleware<JwtBlackMiddleware>(); // �������� �¦W��
//app.UseAuthentication(); // ��������
app.UseAuthorization(); // ��������

app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
