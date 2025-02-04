using heyoushu.Models;
using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;


namespace heyoushu.Controllers.Backstage
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForumController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊
        private readonly ILogger<ForumController> _logger; // 加入 logger
        public ForumController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<ForumController> logger)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; // 初始化 logger
        }

        [HttpGet]
        [Route("Get_Unchecked_Question")]
        public async Task<JsonResult> Get_Unchecked_Question()
        {
            List<ForumQuestionModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Name, Content FROM forum_question WHERE Acceptance = 0 ORDER BY creationDate DESC ", Connection))
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
                                Content = SqlReader.GetString(2),
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
        [Route("Accept_Question")]
        public async Task<JsonResult> Accept_Question([FromBody] ForumQuestionModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE forum_question SET Acceptance = 1, Category_Id = @Category_Id WHERE Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    Command.Parameters.Add("@Category_Id", MySqlDbType.UInt32).Value = updateData.Category_Id;
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
        [Route("Update_Banner")]
        public async Task<JsonResult> Update_Banner([FromBody] BannerModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE forum SET FileName = @FileName WHERE Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;
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
        [Route("Update_Category")]
        public async Task<JsonResult> Update_Category([FromBody] CategoryModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE forum_question_category SET CategoryName = @CategoryName WHERE Id = @Id", Connection))
                {
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
                Connection.Open();
                using (var Command = new MySqlCommand($"INSERT INTO forum_question_category (CategoryName) values (@CategoryName)", Connection))
                {
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
                Connection.Open();
                using (var Command = new MySqlCommand($"DELETE FROM forum_question_category WHERE Id = @Id", Connection))
                {
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
        [HttpPost]
        [Route("Create_Answer_Official")]
        public async Task<JsonResult> Create_Answer_Official([FromBody] ForumAnswerModel createData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"INSERT INTO forum_answer (Question_Id, Official, Pharmacist_Id, Content) values (@Question_Id, 1, @Pharmacist_Id, @Content)", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Question_Id", MySqlDbType.UInt32).Value = createData.Question_Id;
                    Command.Parameters.Add("@Pharmacist_Id", MySqlDbType.UInt32).Value = createData.Pharmacist_Id;
                    Command.Parameters.Add("@Content", MySqlDbType.VarChar, 1000).Value = createData.Content;
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
        [Route("Create_Answer")]
        public async Task<JsonResult> Create_Answer([FromBody] ForumAnswerModel createData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"INSERT INTO forum_answer (Question_Id, GuestName, Content) values (@Question_Id, @GuestName, @Content)", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Question_Id", MySqlDbType.UInt32).Value = createData.Question_Id;
                    Command.Parameters.Add("@GuestName", MySqlDbType.VarChar, 260).Value = createData.Name;
                    Command.Parameters.Add("@Content", MySqlDbType.VarChar, 1000).Value = createData.Content;
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
        [Route("Update_Answer")]
        public async Task<JsonResult> Update_Answer([FromBody] ForumAnswerModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE forum_answer Set Official=@Official, Pharmacist_Id=@Pharmacist_Id, Content=@Content WHERE Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = updateData.Id;
                    Command.Parameters.Add("@Official", MySqlDbType.Bool).Value = updateData.Official;
                    Command.Parameters.Add("@Pharmacist_Id", MySqlDbType.UInt32).Value = updateData.Pharmacist_Id;
                    Command.Parameters.Add("@Content", MySqlDbType.VarChar, 1000).Value = updateData.Content;
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
        [Route("Delete_Answer")]
        public async Task<JsonResult> Delete_Answer([FromBody] ForumAnswerModel deleteData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"DELETE FROM forum_answer WHERE Id = @Id", Connection))
                {
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
        [HttpPost]
        [Route("Delete_Question")]
        public async Task<JsonResult> Delete_Question([FromBody] ForumQuestionModel deleteData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"DELETE FROM forum_question WHERE Id = @Id", Connection))
                {
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
        private async Task<List<BannerModel>> Get_BannerList()
        {
            List<BannerModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, FileName FROM forum", Connection))
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
        private async Task<List<CategoryModel>> Get_CategoryList()
        {
            List<CategoryModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, CategoryName FROM forum_question_category ORDER BY Id DESC", Connection))
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
        private async Task<List<ForumQuestionModel>> Get_QuestionList()
        {
            List<ForumQuestionModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Category_Id, Name, Content, Acceptance FROM forum_question", Connection))
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
                                Name = SqlReader.GetString(2),
                                Content = SqlReader.GetString(3),
                                Acceptance = SqlReader.GetBoolean(4),
                                AnswerList = await Get_AnswerList(SqlReader.GetUInt32(0))
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        private async Task<List<ForumAnswerModel>> Get_AnswerList(uint id)
        {
            List<ForumAnswerModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT ans.Id, Question_Id, Official, Name, FileName, Position, Pharmacy, Content, GuestName FROM forum_answer ans LEFT JOIN pharmacist ph ON ans.Pharmacist_Id = ph.Id WHERE Question_Id = {id} ORDER BY CreationDate DESC", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Question_Id = SqlReader.GetUInt32(1),
                                Official = SqlReader.GetBoolean(2),
                                Name = SqlReader.IsDBNull(3) ? SqlReader.GetString(8) : SqlReader.GetString(3),
                                FileName = SqlReader.IsDBNull(4) ? string.Empty : SqlReader.GetString(4),
                                Position = SqlReader.IsDBNull(5) ? string.Empty : SqlReader.GetString(5),
                                Pharmacy = SqlReader.IsDBNull(6) ? string.Empty : SqlReader.GetString(6),
                                Content = SqlReader.GetString(7),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        [HttpGet]
        [Route("Get_Data")]
        public async Task<JsonResult> Get_Data()
        {
            ForumResult result = new()
            {
                BannerList = await Get_BannerList(),
                CategoryList = await Get_CategoryList(),
                QuestionList = await Get_QuestionList(),
            };
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }

        [HttpPost]
        [Route("Create_Question")]
        public async Task<JsonResult> Create_Question([FromBody] ForumQuestionModel createData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"INSERT INTO forum_question (Name, Content) values (@Name, @Content)", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Name", MySqlDbType.VarChar, 260).Value = createData.Name;
                    Command.Parameters.Add("@Content", MySqlDbType.VarChar, 260).Value = createData.Content;
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
