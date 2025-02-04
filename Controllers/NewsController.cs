using Microsoft.AspNetCore.Mvc;
using heyoushu.Models;
using heyoushu.Models.Backstage;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;


namespace heyoushu.Controllers
{
    public class NewsController : Controller
    {
        private readonly ILogger<NewsController> _logger;
        private readonly IConfiguration _configuration;

        public NewsController(ILogger<NewsController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        private async Task<List<NewsModel>> GetLatestNews(uint limit)
        {
            List<NewsModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Title, FileName from news ORDER BY CreationDate DESC LIMIT {limit}", Connection))
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
                using (var Command = new MySqlCommand($"SELECT DisplayOrder, Text, FileName, TypeSetting from news_content WHERE News_Id = {Id}", Connection))
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
        public async Task<IActionResult> Index()
        {
            NewsResult data = new()
            {
                LatestNews = await GetLatestNews(3),
                NewsList = await GetNewsList(0),
            };
            ViewData["Title"] = "最新消息";

            return View(data);
        }

        [Route("[controller]/Content/{id?}")]
        public async Task<IActionResult> NewsContent(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "1" : id;
            NewsModel news = await GetNews(Convert.ToUInt32(Id));
            NewsContentResult data = new()
            {
                News_Id = news.Id,
                Title = news.Title,
                FileName = news.FileName,
                CreationDate = news.CreationDate,
                NewsContent = await GetContent(Convert.ToUInt32(Id)),
                LatestNews = await GetLatestNews(4),
                HeadContent = news.HeadContent,
            };
            ViewData["Title"] = news.Title;
            return View(data);
        }
    }
}
