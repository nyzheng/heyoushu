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
    public class BannerController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊

        public BannerController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Route("Get_Data")]

        public async Task<JsonResult> Get_Data()
        {
            List<BannerModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, FileName FROM banner", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                FileName = SqlReader.GetString(1),
                            });

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
        public async Task<JsonResult> Update_Data([FromBody] BannerModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update banner Set  FileName=@FileName Where Id={data.Id};", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = data.FileName;
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
