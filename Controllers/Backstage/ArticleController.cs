using Microsoft.AspNetCore.Mvc;
using heyoushu.Models.RequiredModel;
using MySqlConnector;
using heyoushu.Models.Backstage;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing.Constraints;

namespace heyoushu.Backstage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // 匿名
    public class ArticleController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊
        private readonly ILogger<ArticleController> _logger; // 加入 logger
        public ArticleController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<ArticleController> logger)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; // 初始化 logger

        }

        //焦點文章、熱門文章、正常文章(四分類)
        [HttpGet]
        [Route("Get_Data")]
        public async Task<JsonResult> Get_Data()
        {
            ArticleResult result = new ArticleResult();
            result.CategoryList = await GetArticleCategoryList();
            result.ArticleList = await GetArticleList(result.CategoryList);
            result.PopularArticleList = await GetPopularArticleList();
            result.FeaturedArticle = await GetPopularArticleList();

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }

        [HttpGet]
        [Route("Get_ArticleList/{Id}/{Page}")]
        public async Task<JsonResult> Get_ArticleList(uint Id, uint Page)
        {
            List<ArticleModel> result = new ();
            uint Offset = Page * 9;
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName, Category_Id from article WHERE Category_Id= {Id} ORDER BY creationDate DESC LIMIT 9 OFFSET {Offset}", Connection))
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
                                Category_Id = SqlReader.GetUInt32(3),
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
        [Route("Get_AllArticleList/{Id}")]
        public async Task<JsonResult> Get_AllArticleList(uint Id)
        {
            List<ArticleModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName, Category_Id from article WHERE Category_Id= {Id} ORDER BY creationDate DESC", Connection))
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
                                Category_Id = SqlReader.GetUInt32(3),
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
        private async Task<List<ArticleModel>> GetArticleList(List<ArticleCategory> CategoryList)
        {
            List<ArticleModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                foreach ( var category in CategoryList)
                {
                    using (var Command = new MySqlCommand($"SELECT Id , Category_Id , Title , FileName , Popularity FROM article WHERE Category_Id = {category.Id} LIMIT 3;", Connection))
                    {
                        using (MySqlDataReader SqlReader = Command.ExecuteReader())
                        {
                            while (SqlReader.Read())
                            {
                                List<string> ArticleTag = new();
                                uint id = SqlReader.GetUInt32(0);
                                await using (var Connection2 = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
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
        private async Task<List<ArticleModel>> GetPopularArticleList()
        {
            List<ArticleModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
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
        private async Task<List<ArticleCategory>> GetArticleCategoryList()
        {
            List<ArticleCategory> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
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
                                FileName = SqlReader.GetString (2),
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
        public async Task<JsonResult> Create_Data([FromBody] ArticleModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Insert Into article (Title, FileName, Category_Id, CreationDate) values (@Title, @FileName, @Category_Id, @CreationDate)", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Title", MySqlDbType.VarChar, 260).Value = data.Title;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = data.FileName;
                    Command.Parameters.Add("@Category_Id", MySqlDbType.UInt32).Value = data.Category_Id;
                    Command.Parameters.Add("@CreationDate", MySqlDbType.VarChar, 20).Value = data.CreationDate;


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
        [Route("Delete_Data")]
        public async Task<JsonResult> Delete_Data([FromBody] ArticleModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Delete From Article Where Id = @Id", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = data.Id;

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
        [Route("Update_CategoryName")]
        public async Task<JsonResult> Update_CategoryName([FromBody] ArticleCategory articleCategory)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"UPDATE article_category SET CategoryName = @CategoryName, FileName = @FileName WHERE  Id = {articleCategory.Id}", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@CategoryName", MySqlDbType.VarChar, 260).Value = articleCategory.CategoryName;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = articleCategory.FileName;

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
        public async Task<JsonResult> Create_Category([FromBody] ArticleCategory articleCategory)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Insert Into article_category (CategoryName) values (@CategoryName)", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@CategoryName", MySqlDbType.VarChar, 260).Value = articleCategory.CategoryName;
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
        public async Task<JsonResult> Delete_Category([FromBody] ArticleCategory articleCategory)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Delete From article_category Where Id = @Id", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = articleCategory.Id;
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
        [Route("Get_Content/{Id}")]
        public async Task<JsonResult> Get_Content(uint Id)
        {
            ArticleContentResult result = new ArticleContentResult();
            uint category = 0;
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id , Title , FileName, Category_Id, Popularity, HeadContent from article WHERE Id= {Id} ", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Article.Id = SqlReader.GetUInt32(0);
                            result.Article.Title = SqlReader.GetString(1);
                            result.Article.FileName = SqlReader.GetString(2);
                            result.Article.Popularity = SqlReader.GetUInt32(4);
                            result.Article.HeadContent= SqlReader.GetString(5);
                            category = SqlReader.GetUInt32(3);
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

                using (var Command = new MySqlCommand($"Select Id , Title , FileName From article Where Category_Id = {category} and Id != {Id} ", Connection))
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
        [Route("Update_Content")]
        public async Task<JsonResult> Update_Content([FromBody] ArticleContentRequest updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update article Set Title = @Title , FileName = @FileName Where Id = {updateData.Id}", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Title", MySqlDbType.VarChar, 260).Value = updateData.Title;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;

                    await Command.ExecuteNonQueryAsync();
                }

                using (var Command = new MySqlCommand($"Delete From article_content Where Article_Id = {updateData.Id}", Connection))
                {
                    await Command.ExecuteNonQueryAsync();
                }

                foreach (var content in updateData.ArticleContent)
                {
                    using (var Command = new MySqlCommand($"Insert Into article_Content (Article_Id , DisplayOrder , Text , FileName , TypeSetting) values (@Article_Id , @DisplayOrder , @Text , @FileName , @TypeSetting) ", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Article_Id", MySqlDbType.UInt32).Value = updateData.Id;
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

        [HttpPost]
        [Route("Update_Popularity")]
        public async Task<JsonResult> Update_Popularity([FromBody] ArticleModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"UPDATE article SET Popularity = @Popularity WHERE  Id = {data.Id}", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Popularity", MySqlDbType.VarChar, 260).Value = data.Popularity;
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
        [Route("Get_Tag/{Id}")]
        public async Task<JsonResult> Get_Tag(string Id)
        {
            List<string> result = new List<string>();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Select TagName from article_tag Where Article_Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = Convert.ToUInt32(Id);

                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(SqlReader.GetString(0));
                        }
                    }
                }
            }

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }

        [HttpPost]
        [Route("Update_Tag")]
        public async Task<JsonResult> Update_Tag([FromBody] ArticleModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Delete From article_tag Where Article_Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    await Command.ExecuteNonQueryAsync();
                }

                foreach (var tagName in updateData.ArticleTag)
                {
                    using (var Command = new MySqlCommand($"Insert Into article_tag (Article_Id,TagName) values (@Article_Id, @TagName) ", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Article_Id", MySqlDbType.UInt32).Value = updateData.Id;
                        Command.Parameters.Add("@TagName", MySqlDbType.VarChar, 260).Value = tagName;
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
        [Route("Update_Meta")]
        public async Task<JsonResult> Update_Meta([FromBody] ArticleModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE article SET HeadContent = @HeadContent WHERE Id = @Id", Connection))
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
