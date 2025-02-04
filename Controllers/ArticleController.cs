using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

using static heyoushu.Models.RequiredModel.Heyoushu_Shared;


namespace heyoushu.Controllers
{

    public class ArticleController : Controller
    {
        private readonly ILogger<ArticleController> _logger;
        private readonly IConfiguration _configuration;

        public ArticleController(ILogger<ArticleController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
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
        public List<ArticleCategory> GetArticleCategoryList()
        {
            List<ArticleCategory> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, CategoryName, FileName FROM article_category", Connection))
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
                                FileName = SqlReader.GetString(2),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        private List<ArticleModel> GetPopularArticleList()
        {
            List<ArticleModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , Popularity FROM article ORDER BY Popularity DESC LIMIT 4", Connection))
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
                                Popularity = SqlReader.GetUInt32(2),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }

        private List<ArticleModel> GetFeaturedArticleList()
        {
            List<ArticleModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName FROM article ORDER BY RAND() LIMIT 3;", Connection))
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
        private List<ArticleModel> GetArticleList(uint categoryId, uint page)
        {
            List<ArticleModel> result = new();
            uint Offset = page * 9;
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName FROM article Where Category_Id = {categoryId} ORDER BY creationDate DESC LIMIT 9 OFFSET {Offset};", Connection))
                {
                    Connection.Open();
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
                                Title = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                ArticleTag = ArticleTag,
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        public ArticleContentResult Get_Content(uint Id)
        {
            ArticleContentResult result = new ();
            uint category = 0;
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT article.Id , Title , article.FileName, Category_Id, CategoryName, HeadContent FROM article JOIN article_category on article.Category_Id = article_category.Id WHERE article.Id= {Id} ", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Article.Id = SqlReader.GetUInt32(0);
                            result.Article.Title = SqlReader.GetString(1);
                            result.Article.FileName = SqlReader.GetString(2);
                            category = SqlReader.GetUInt32(3);
                            result.Article.CategoryName = SqlReader.GetString(4);
                            result.Article.HeadContent = SqlReader.GetString(5);
                        }
                    }
                }
                using (var Command = new MySqlCommand($"SELECT DisplayOrder , Text , FileName , TypeSetting from article_content WHERE Article_Id={Id}", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.ArticleContent.Add(new()
                            {
                                DisplayOrder = SqlReader.GetUInt32(0),
                                Text = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                TypeSetting = SqlReader.GetString(3),
                            });
                        }
                    }
                }

                using (var Command = new MySqlCommand($"Select Id , Title , FileName From article Where Category_Id = {category} and Id != {Id} Limit 3", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.SameCategoryArticle.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Title = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                            });

                        }
                    }
                }

                using (var Command = new MySqlCommand($"SELECT Id , Title , Popularity FROM article ORDER BY Popularity DESC LIMIT 4", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PopularArticleList.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Title = SqlReader.GetString(1),
                                Popularity = SqlReader.GetUInt32(2),
                            });

                        }
                    }
                }

                Connection.Close();
            }
            return result;
        }

        public async Task UpdatePopularity(uint id)
        {
            uint popularity = 0;
            await using(var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT Popularity FROM article Where Id = {id};", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            popularity = SqlReader.GetUInt32(0);
                        }
                    }
                }
                popularity++;
                using (var Command = new MySqlCommand($"Update article Set Popularity = {popularity} Where Id = {id};", Connection))
                {
                    await Command.ExecuteNonQueryAsync();
                }
                Connection.Close();
            }
        }
        public string GetCategoryName(string Category_Id)
        {
            string categoryName = string.Empty;
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT CategoryName FROM article_category Where Id = {Convert.ToUInt32(Category_Id)};", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            categoryName = SqlReader.GetString(0);
                        }
                    }
                }
                Connection.Close();
            }
            return categoryName;
        }
        public List<ArticleModel> GetArticleListByTag(string TagName)
        {
            List<uint> ArticleIdList = new List<uint>();
            List<ArticleModel> result = new List<ArticleModel>();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT Article_Id FROM article_tag Where TagName = @TagName;", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@TagName", MySqlDbType.VarChar, 260).Value = TagName;
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            ArticleIdList.Add(SqlReader.GetUInt32(0));
                        }
                    }
                }
                foreach (var ArticleId in ArticleIdList)
                {
                    using (var Command = new MySqlCommand($"SELECT Id, Title, FileName FROM article Where Id = @Id;", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = ArticleId;
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

                                result.Add(new(){
                                    Id = SqlReader.GetUInt32(0),
                                    Title = SqlReader.GetString(1),
                                    FileName = SqlReader.GetString(2),
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
        public IActionResult Index()
        {
            ArticleResult data = new ArticleResult();
            data.CategoryList = GetArticleCategoryList();
            data.ArticleList = Get_ArticleData(data.CategoryList);
            data.PopularArticleList = GetPopularArticleList();
            data.FeaturedArticle = GetFeaturedArticleList();
            ViewData["Title"] = "荷友舒聊百病";
            return View(data);
        }

        [Route("[controller]/List/{categoryId?}")]
        public IActionResult List(string categoryId)
        {
            string CategoryId = string.IsNullOrEmpty(categoryId) ? "1" : categoryId;
            ArticleResult data = new()
            {
                ArticleList = GetArticleList(Convert.ToUInt32(CategoryId), 0),
                CategoryList = GetArticleCategoryList(),
            };
            ViewData["CategoryId"] = Convert.ToUInt32(CategoryId);
            ViewData["CategoryName"] = GetCategoryName(CategoryId);
            ViewData["Title"] = GetCategoryName(CategoryId);
            return View(data);
        }

        [Route("[controller]/Content/{id?}")]
        public async Task<IActionResult> ArticleContent(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "1" : id;
            ArticleContentResult data = Get_Content(Convert.ToUInt32(Id));
            await UpdatePopularity(Convert.ToUInt32(Id));
            ViewData["Title"] = data.Article.Title;
            return View(data);
        }

        [Route("[controller]/Tag/{TagName}")]
        public IActionResult Tag(string TagName)
        {
            ArticleResult data = new()
            {
                ArticleList = GetArticleListByTag(TagName),
                CategoryList = GetArticleCategoryList(),
            };
            ViewData["TagName"] = TagName;
            ViewData["Title"] = TagName;
            return View(data);
        }

    }
}
