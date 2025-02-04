using Microsoft.AspNetCore.Mvc;
using heyoushu.Models;
using heyoushu.Models.Backstage;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using System.Data;


namespace heyoushu.Controllers
{
    public class ProductController : Controller
    {
        private readonly ILogger<ProductController> _logger;
        private readonly IConfiguration _configuration;

        public ProductController(ILogger<ProductController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        private async Task<List<PageDataModel>> Get_PageData()
        {
            List<PageDataModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Text, FileName, Link FROM product_page", Connection))
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
                                Link = SqlReader.GetString(3),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        private async Task<List<ProductModel>> Get_ProductList()
        {
            List<ProductModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Title, FileName, Score, Popularity, Tag FROM product ORDER BY DisplayOrder LIMIT 9", Connection))
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
                                Score = SqlReader.GetDecimal(3),
                                Popularity = SqlReader.GetUInt32(4),
                                Tag = SqlReader.GetString(5),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }

        private async Task<List<ProductContentModel>> Get_ContentList(uint id)
        {
            List<ProductContentModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT Area, Text, FileName FROM product_content WHERE Product_Id = @Product_Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Product_Id", id);
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Area= SqlReader.GetString(0),
                                Text= SqlReader.GetString(1),
                                FileName= SqlReader.GetString(2),
                            });
                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        private async Task<List<ProductCommentModel>> Get_CommentList(uint id)
        {
            List<ProductCommentModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT TypeSetting, Text, pc.FileName, Name, Position, Pharmacy, ph.FileName, Score  FROM product_comment pc JOIN pharmacist ph ON pc.Pharmacist_Id=ph.Id WHERE pc.Product_Id = @Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Id", id);
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                TypeSetting = SqlReader.GetString(0),
                                Text = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                Score= SqlReader.GetDecimal(7),
                                Pharmacist = new()
                                {
                                    Name= SqlReader.GetString(3),
                                    Position= SqlReader.GetString(4),
                                    Pharmacy= SqlReader.GetString(5),
                                    FileName= SqlReader.GetString(6),
                                }
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
            ProductResult data = new()
            {
                PageDataList = await Get_PageData(),
                ProductList = await Get_ProductList(),
            };
            return View(data);
        }

        [Route("[controller]/Content/{id?}")]
        public async Task<IActionResult> ProductContent(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "1" : id;
            ProductContentResult data = new()
            {
                PageDataList = await Get_PageData(),
                ContentList = await Get_ContentList(Convert.ToUInt32(Id)),
                CommentList = await Get_CommentList(Convert.ToUInt32(Id)),
            };

            return View(data);
        }
    }
}
