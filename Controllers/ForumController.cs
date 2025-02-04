    using Microsoft.AspNetCore.Mvc;
using heyoushu.Models;
using heyoushu.Models.Backstage;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers
{
    public class ForumController : Controller
    {
        private readonly ILogger<ForumController> _logger;
        private readonly IConfiguration _configuration;

        public ForumController(ILogger<ForumController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
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
                using (var Command = new MySqlCommand($"SELECT Id, Category_Id, Name, Content, Acceptance FROM forum_question WHERE Acceptance = 1", Connection))
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
                using (var Command = new MySqlCommand($"SELECT Official, Name, FileName, Position, Pharmacy, Content, GuestName FROM forum_answer ans LEFT JOIN pharmacist ph ON ans.Pharmacist_Id = ph.Id WHERE Question_Id = {id} ORDER BY CreationDate DESC", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Official = SqlReader.GetBoolean(0),
                                Name = SqlReader.IsDBNull(1) ? SqlReader.GetString(6) : SqlReader.GetString(1),
                                FileName = SqlReader.IsDBNull(2) ? string.Empty : SqlReader.GetString(2),
                                Position = SqlReader.IsDBNull(3) ? string.Empty : SqlReader.GetString(3),
                                Pharmacy = SqlReader.IsDBNull(4) ? string.Empty : SqlReader.GetString(4),
                                Content = SqlReader.GetString(5),
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
            ForumResult data = new()
            {
                BannerList = await Get_BannerList(),
                CategoryList = await Get_CategoryList(),
                QuestionList = await Get_QuestionList(),
            };
            ViewData["Title"] = "藥品即時問";

            return View(data);
        }
    }
}
