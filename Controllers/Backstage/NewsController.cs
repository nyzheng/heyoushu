using heyoushu.Models;
using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers.Backstage
{
    [Route("api/[controller]")]
    [ApiController]

    public class NewsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊
        private readonly ILogger<NewsController> _logger; // 加入 logger
        public NewsController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<NewsController> logger)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; // 初始化 logger

        }


        [HttpGet]
        [Route("Get_Data")]
        public async Task<JsonResult> Get_Data(uint Region_Id)
        {
            List<NewsModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName from news ORDER BY creationDate DESC", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Title = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
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

        [HttpGet]
        [Route("GetNewsList/{page}")]
        public async Task<List<NewsModel>> GetNewsList(uint Page)
        {
            List<NewsModel> result = new();
            uint Offset = Page * 9;
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName from news ORDER BY creationDate DESC LIMIT 9 OFFSET {Offset}", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Title = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                            });
                        }
                    }
                }
                Connection.Close();
            }

            return result;
        }

        [HttpPost]
        [Route("Create_Data")]
        public async Task<JsonResult> Create_Data([FromBody] NewsModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"INSERT INTO news (Title, FileName, CreationDate) values (@Title, @FileName, @CreationDate)", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Title", MySqlDbType.VarChar, 260).Value = data.Title;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = data.FileName;
                    Command.Parameters.Add("@CreationDate", MySqlDbType.VarChar, 20).Value = data.CreationDate;
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
        [Route("Delete_Data")]
        public async Task<JsonResult> Delete_Data([FromBody] NewsModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"DELETE FROM news WHERE Id = @Id", Connection))
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

        [HttpGet]
        [Route("Get_Content/{id}")]
        public async Task<JsonResult> NewsContent(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "1" : id;
            NewsModel news = await GetNews(Convert.ToUInt32(Id));
            NewsContentResult result = new()
            {
                News_Id = news.Id,
                Title = news.Title,
                FileName = news.FileName,
                CreationDate = news.CreationDate,
                HeadContent = news.HeadContent,
                NewsContent = await GetContent(Convert.ToUInt32(Id)),
            };
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }

        [HttpPost]
        [Route("Update_Content/")]
        public async Task<JsonResult> Update_Content([FromBody] NewsContentResult updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                    Connection.Open();
                using (var Command = new MySqlCommand($"Update news Set Title = @Title , FileName = @FileName, CreationDate=@CreationDate Where Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", updateData.News_Id);
                    Command.Parameters.Add("@Title", MySqlDbType.VarChar, 260).Value = updateData.Title;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;
                    Command.Parameters.Add("@CreationDate", MySqlDbType.VarChar, 20).Value = updateData.CreationDate;

                    await Command.ExecuteNonQueryAsync();
                }

                using (var Command = new MySqlCommand($"Delete From news_content Where News_Id = @News_Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@News_Id", updateData.News_Id);
                    await Command.ExecuteNonQueryAsync();
                }

                foreach (var content in updateData.NewsContent)
                {
                    using (var Command = new MySqlCommand($"Insert Into news_content (News_Id , DisplayOrder , Text , FileName , TypeSetting) values (@News_Id , @DisplayOrder , @Text , @FileName , @TypeSetting) ", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@News_Id", MySqlDbType.UInt32).Value = updateData.News_Id;
                        Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = content.DisplayOrder;
                        Command.Parameters.Add("@Text", MySqlDbType.VarChar, 10000).Value = content.Text;
                        Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = content.FileName;
                        Command.Parameters.Add("@TypeSetting", MySqlDbType.VarChar, 260).Value = content.TypeSetting;
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

        public async Task<NewsModel> GetNews(uint Id)
        {
            NewsModel result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName, CreationDate, HeadContent from news WHERE Id = {Id}", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result = new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Title = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                CreationDate = SqlReader.GetString(3),
                                HeadContent = SqlReader.GetString(4),
                            };
                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        public async Task<List<NewsContentModel>> GetContent(uint Id)
        {
            List<NewsContentModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT DisplayOrder , Text , FileName, TypeSetting from news_content WHERE News_Id = {Id}", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                DisplayOrder = SqlReader.GetUInt32(0),
                                Text = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                TypeSetting = SqlReader.GetString(3),
                            });
                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }

        [HttpPost]
        [Route("Update_Meta")]
        public async Task<JsonResult> Update_Meta([FromBody] NewsModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE news SET HeadContent = @HeadContent WHERE Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    Command.Parameters.Add("@HeadContent", MySqlDbType.VarChar, 10000).Value = updateData.HeadContent;
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
