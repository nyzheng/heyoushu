using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using heyoushu.Models;

using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;

namespace heyoushu.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        private List<PharmacistModel> Get_PharmacistData()
        {
            List<PharmacistModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Name, Pharmacy, FileName, Position FROM pharmacist ORDER BY DisplayOrder;", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Name = SqlReader.GetString(1),
                                Pharmacy = SqlReader.GetString(2),
                                FileName =  SqlReader.GetString(3),
                                Position = SqlReader.GetString(4),
                            });
                        }
                    }
                }
                Connection.Close();
            }

            return result;
        }
        public List<ArticleModel> Get_ArticleData(List<ArticleCategory> CategoryList)
        {
            List<ArticleModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                foreach (var category in CategoryList)
                {
                    using (var Command = new MySqlCommand($"SELECT Id , Category_Id , Title , FileName , Popularity FROM article WHERE Category_Id = {category.Id} ORDER BY creationDate DESC LIMIT 3;", Connection))
                    {
                        using (MySqlDataReader SqlReader = Command.ExecuteReader())
                        {
                            while (SqlReader.Read())
                            {
                                List<string> ArticleTag = new();
                                uint id = SqlReader.GetUInt32(0);
                                using (var Connection2 = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
                                {
                                    Connection2.Open();
                                    using (var Command2 = new MySqlCommand($"Select TagName from article_tag Where Article_Id = @Id", Connection2))
                                    {
                                        Command2.Parameters.Clear();
                                        Command2.Parameters.Add("@Id", MySqlDbType.UInt32).Value = id;

                                        using (MySqlDataReader SqlReader2 = Command2.ExecuteReader())
                                        {
                                            while (SqlReader2.Read())
                                            {
                                                ArticleTag.Add(SqlReader2.GetString(0));
                                            }
                                        }
                                    }
                                }
                                result.Add(new()
                                {
                                    Id = SqlReader.GetUInt32(0),
                                    Category_Id = SqlReader.GetUInt32(1),
                                    Title = SqlReader.GetString(2),
                                    FileName = SqlReader.GetString(3),
                                    Popularity = SqlReader.GetUInt32(4),
                                    ArticleTag = ArticleTag,
                                });


                            }
                        }
                    }
                }
                Connection.Close();
            }

            return result;
        }

        private List<ArticleCategory> GetArticleCategoryList()
        {
            List<ArticleCategory> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , CategoryName FROM article_category", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                CategoryName = SqlReader.GetString(1),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        private List<BannerModel> Get_BannerData()
        {
            List<BannerModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, FileName From banner;", Connection))
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
            return result;
        }
        private List<TiktokModel> Get_TiktokData()
        {
            List<TiktokModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, FileName, Link From tiktok;", Connection))
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

            return result;
        }

        public List<BannerModel2> Get_Banner()
        {
            List<BannerModel2> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
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
            return result;
        }
        public IActionResult Index()
        {
            List<ArticleCategory> categoryList = GetArticleCategoryList();
            HomeResult data = new()
            {
                PharmacistData = Get_PharmacistData(),
                ArticleData = Get_ArticleData(categoryList),
                CategoryData = categoryList,
                BannerData = Get_Banner(),
                TiktokData = Get_TiktokData(),
                PageData = Get_BannerData()
            };
            ViewData["Title"] = "首頁";

            return View(data);
        }
    }
}
