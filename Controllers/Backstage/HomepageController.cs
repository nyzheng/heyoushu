using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using heyoushu.Models.RequiredModel;
using heyoushu.Models.Backstage;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using Microsoft.AspNetCore.Authorization;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace heyoushu.Backstage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // 匿名
    public class HomepageController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊
        private readonly ILogger<HomepageController> _logger; // 加入 logger
        public HomepageController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<HomepageController> logger)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; // 初始化 logger
        }

        [HttpGet]
        [Route("Get_Data")]
        public async Task<JsonResult> Get_Data()
        {
            HomepageResult result = new HomepageResult();
            result.PharmacistList = await GetPharmacistList();
            result.ArticleList = await GetArticleList();

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }

        private async Task<List<PharmacistModel>> GetPharmacistList()
        {
            List<PharmacistModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, PharmacistName, Position , Pharmacy , CoverPhoto FROM pharmacist_profiles", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                //PharmacistName = SqlReader.GetString(1),
                                //Position = SqlReader.GetString(2),
                                //Pharmacy = SqlReader.GetString(3),
                                //CoverPhoto = SqlReader.GetString(4),
                            });

                        }
                    }
                }
                    Connection.Close();
            }
            return result;
        }
        private async Task<List<ArticleModel>> GetArticleList()
        {
            List<ArticleModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"( SELECT Id , Class , Title , CoverPhoto , Popularity from article WHERE class = 1   ORDER BY creationDate DESC LIMIT 3 ) UNION ALL ( SELECT Id , Class , Title ,  CoverPhoto , Popularity from article WHERE class = 2   ORDER BY creationDate DESC LIMIT 3 ) UNION ALL ( SELECT Id , Class , Title ,  CoverPhoto , Popularity from article WHERE class = 3   ORDER BY creationDate DESC LIMIT 3 ) UNION ALL ( SELECT Id , Class , Title ,  CoverPhoto , Popularity from article WHERE class = 4   ORDER BY creationDate DESC LIMIT 3 )", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Category_Id = SqlReader.GetUInt32(1),
                                Title = SqlReader.GetString(2),
                                FileName = SqlReader.GetString(3),
                                Popularity = SqlReader.GetUInt32(4),
                            });

                        }
                    }
                }
                    Connection.Close();
            }
            return result;
        }

        [HttpGet]
        [Route("Get_Tiktok")]
        public async Task<JsonResult> Get_Tiktok()
        {
            List<TiktokModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, FileName, Link FROM tiktok", Connection))
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
                                Link = SqlReader.GetString(2),

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
        [Route("Update_Tiktok")]
        public async Task<JsonResult> Update_Tiktok([FromBody] TiktokModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Update tiktok Set FileName = @FileName, Link = @Link Where Id = {data.Id}", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 10000).Value = data.FileName;
                    Command.Parameters.Add("@Link", MySqlDbType.VarChar, 10000).Value = data.Link;
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

        [HttpGet]
        [Route("Get_Banner")]

        public async Task<JsonResult> Get_Banner()
        {
            List<BannerModel2> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Img, Device FROM homepage_banner", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Img = SqlReader.GetString(1),
                                Device = SqlReader.GetString(2),
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
        [Route("Update_Banner")]
        public async Task<JsonResult> Update_Data([FromBody] BannerModel2 data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update homepage_banner Set Img=@Img Where Id=@Id;", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", data.Id);
                    Command.Parameters.Add("@Img", MySqlDbType.VarChar, 260).Value = data.Img;
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
        [HttpPost]
        [Route("Create_Banner")]
        public async Task<JsonResult> Create_Data([FromBody] BannerModel2 data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"INSERT INTO homepage_banner (Img, Device) VALUES (@Img, @Device);", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Img", MySqlDbType.VarChar, 260).Value = data.Img;
                    Command.Parameters.Add("@Device", MySqlDbType.VarChar, 260).Value = data.Device;
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

        [HttpPost]
        [Route("Delete_Banner")]
        public async Task<JsonResult> Delete_Data([FromBody] BannerModel2 data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"DELETE FROM homepage_banner WHERE Id=@Id;", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", data.Id);
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
