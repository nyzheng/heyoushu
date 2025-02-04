using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers.Backstage
{
    [Route("api/[controller]")]
    [ApiController]
    public class FooterController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊

        public FooterController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Route("Get_Data")]
        public async Task<JsonResult> Get_Data()
        {
            FooterModel result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Text FROM footer Where Id = 1", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Text = SqlReader.GetString(0);
                        }
                    }
                }
                Connection.Close();
            }
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }

        [HttpPost]
        [Route("Update_Data")]
        public async Task<JsonResult> Update_Data([FromBody] FooterModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Update footer Set Text=@Text Where Id=1;", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Text", MySqlDbType.VarChar, 1000).Value = data.Text;
                    Command.ExecuteNonQuery();
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
