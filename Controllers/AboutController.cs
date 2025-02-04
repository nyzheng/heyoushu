using heyoushu.Models.Backstage;
using heyoushu.Models;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers
{
    public class AboutController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public AboutController(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }


        #region Get_Data

        private List<AboutModel> Get_Data(string id)
        {
            List<AboutModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Text, FileName, TypeSetting  FROM about Where Category_Id={Convert.ToUInt32(id)} ORDER BY DisplayOrder; ", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
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
        private List<CategoryModel> Get_Category()
        {
            List<CategoryModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, CategoryName FROM about_category;", Connection))
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

        #endregion


        #region Get_Category


        #endregion


        [Route("About/{id?}")]
        public IActionResult Index(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "1" : id;
            AboutResult data = new()
            {
                AboutData = Get_Data(Id),
                AboutCategory = Get_Category()
            };

            ViewData["Title"] = "關於我們";
            ViewData["id"] = Id;

            return View(data);
        }
    }
}
