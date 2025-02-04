using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using heyoushu.Models;
using heyoushu.Models.RequiredModel;
using heyoushu.Models.Backstage;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using Microsoft.AspNetCore.Authorization;

namespace heyoushu.Backstage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // 匿名
    public class AboutController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊

        public AboutController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Route("Get_Data/{Id}")]
        public async Task<JsonResult> Get_Data(uint Id)
        {
            AboutResult result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT Id, Text, FileName, TypeSetting, DisplayOrder  FROM about Where Category_Id={Id}  ORDER BY DisplayOrder; ", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.AboutData.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Text = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                TypeSetting = SqlReader.GetString(3),
                                DisplayOrder = SqlReader.GetUInt32(4),
                            });
                        }
                    }
                }
                using (var Command = new MySqlCommand($"SELECT Id, CategoryName  FROM about_category;", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.AboutCategory.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                CategoryName = SqlReader.GetString(1),
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
        [Route("Update_Data/{Category_Id}")]
        public async Task<JsonResult> Update_Data([FromBody] List<AboutModel> updateData ,uint Category_Id)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Delete From about Where Category_Id = @Category_Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Category_Id", MySqlDbType.UInt32).Value = Category_Id;
                    await Command.ExecuteNonQueryAsync();
                }
                foreach (var item in updateData)
                {
                    using (var Command = new MySqlCommand($"Insert Into about (Category_Id, DisplayOrder , Text , FileName , TypeSetting) values (@Category_Id ,@DisplayOrder , @Text , @FileName , @TypeSetting) ", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Category_Id", MySqlDbType.UInt32).Value = Category_Id;
                        Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = item.DisplayOrder;
                        Command.Parameters.Add("@Text", MySqlDbType.VarChar, 10000).Value = item.Text;
                        Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = item.FileName;
                        Command.Parameters.Add("@TypeSetting", MySqlDbType.VarChar, 260).Value = item.TypeSetting;
                        await Command.ExecuteNonQueryAsync();
                    }
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
        [Route("Update_Category")]
        public async Task<JsonResult> Update_Category([FromBody] CategoryModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"UPDATE about_category SET CategoryName = @CategoryName WHERE  Id = @Id", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    Command.Parameters.Add("@CategoryName", MySqlDbType.VarChar, 260).Value = updateData.CategoryName;

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
        [HttpPost]
        [Route("Create_Category")]
        public async Task<JsonResult> Create_Category([FromBody] CategoryModel createData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"INSERT INTO about_category (CategoryName) VALUES (@CategoryName)", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@CategoryName", MySqlDbType.VarChar, 260).Value = createData.CategoryName;

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
        [HttpPost]
        [Route("Delete_Category")]
        public async Task<JsonResult> Delete_Category([FromBody] CategoryModel deleteData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"DELETE FROM about_category WHERE  Id = @Id", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", deleteData.Id);

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
