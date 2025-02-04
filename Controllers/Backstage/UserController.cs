using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using heyoushu.Models.Backstage;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers.Backstage
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊

        public UserController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;

        }

        [HttpPost]
        [Route("Login")]
        [AllowAnonymous] // 匿名
        public async Task<JsonResult> Login([FromBody] LoginRequest loginRequest)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Select COALESCE(MAX(UserPassword), '') From user_account Where UserName= @UserName;", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@UserName", loginRequest.UserName);
                    string password = Command.ExecuteScalar()!.ToString()!;

                    if (loginRequest.UserPassword != password)
                        return new JsonResult(new ReturnJson()
                        {
                            HttpCode = 400,
                            Message = "帳號或密碼錯誤!"
                        });
                }
                using (var Command = new MySqlCommand($"Insert Into user_login_record (UserName) values (@UserName)", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@UserName", MySqlDbType.VarChar, 260).Value = loginRequest.UserName;
                    await Command.ExecuteNonQueryAsync();
                }
                Connection.Close();
            }

            return new JsonResult(new ReturnJson()
            {
                HttpCode = 200,
                Message = "OK"
            });
        }

    }
}
