using heyoushu.Models;
using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using static System.Formats.Asn1.AsnWriter;

namespace heyoushu.Controllers.Backstage
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊
        private readonly ILogger<ProductController> _logger; // 加入 logger
        public ProductController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<ProductController> logger)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; // 初始化 logger
        }
        [HttpGet]
        [Route("Get_ProductList/{page}")]
        public async Task<JsonResult> Get_ProductList(uint page)
        {
            List<ProductModel> result = new();
            uint Offset = page * 9;
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Title, FileName, Score, Popularity, Tag FROM product ORDER BY DisplayOrder LIMIT 9 OFFSET {Offset}", Connection))
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
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpGet]
        [Route("Get_AllProductList")]
        public async Task<JsonResult> Get_AllProductList(uint page)
        {
            List<ProductModel> result = new();
            uint Offset = page * 9;
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Title, FileName, Score, Popularity, Tag FROM product ORDER BY DisplayOrder", Connection))
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
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpGet]
        [Route("Get_PageData")]
        public async Task<JsonResult> Get_PageData()
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
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpPost]
        [Route("Update_PageData")]
        public async Task<JsonResult> Update_PageData([FromBody] PageDataModel updateData)
        {
            List<PageDataModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE product_page SET Text=@Text, FileName=@FileName, Link=@Link WHERE Id=@Id", Connection))
                {
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    Command.Parameters.Add("@Text", MySqlDbType.VarChar,260).Value = updateData.Text;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;
                    Command.Parameters.Add("@Link", MySqlDbType.VarChar, 1000).Value = updateData.Link;
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
        [Route("Update_Product")]
        public async Task<JsonResult> Update_Product([FromBody] ProductModel updateData)
        {

            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"UPDATE product SET Title=@Title, FileName=@FileName, Score=@Score, Popularity=@Popularity, Tag=@Tag WHERE Id=@Id", Connection))
                {
                    Command.Parameters.AddWithValue("@Id", updateData.Id);
                    Command.Parameters.Add("@Title", MySqlDbType.VarChar, 260).Value = updateData.Title;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;
                    Command.Parameters.Add("@Score", MySqlDbType.Decimal).Value = updateData.Score;
                    Command.Parameters.Add("@Popularity", MySqlDbType.UInt32).Value = updateData.Popularity;
                    Command.Parameters.Add("@Tag", MySqlDbType.VarChar, 260).Value = updateData.Tag;
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
        [Route("Create_Product")]
        public async Task<JsonResult> Create_Product([FromBody] ProductModel createData)
        {
            uint productId = 0;
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"INSERT INTO product (Title, FileName, Score, Popularity, Tag) values (@Title, @FileName, @Score, @popularity, @Tag)", Connection))
                {
                    Command.Parameters.Add("@Title", MySqlDbType.VarChar, 260).Value = createData.Title;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = createData.FileName;
                    Command.Parameters.Add("@Score", MySqlDbType.Decimal).Value = createData.Score;
                    Command.Parameters.Add("@Popularity", MySqlDbType.UInt32).Value = createData.Popularity;
                    Command.Parameters.Add("@Tag", MySqlDbType.VarChar, 260).Value = createData.Tag;

                    await Command.ExecuteNonQueryAsync();
                }
                Connection.Close();
            }
            await Create_Content();
            return new JsonResult(new ReturnJson()
            {
                HttpCode = 200,
                Message = "OK"
            });
        }
        private async Task<JsonResult> Create_Content()
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                uint id = 0;
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT MAX(Id) AS Id FROM product;)", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            id=SqlReader.GetUInt32(0);
                        }
                    }
                }

                using (var Command = new MySqlCommand($"INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`, `FileName`) VALUES (@Id, 'link', '連結', '/');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`) VALUES (@Id, 'tag', '#標籤');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`) VALUES (@Id, 'title', '標題');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`) VALUES (@Id, 'intro', '商品介紹');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`) VALUES (@Id, 'score', '0');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`) VALUES (@Id, 'pop', '0');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `Text`) VALUES (@Id, 'spec', '');INSERT INTO `heyoushu`.`product_content` (`Product_Id`, `Area`, `FileName`) VALUES (@Id, 'banner', '空白banner.webp');", Connection))
                {
                    Command.Parameters.AddWithValue("@Id", id);

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
        [Route("Delete_Product")]
        public async Task<JsonResult> Delete_Product([FromBody] ProductModel deleteData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"DELETE FROM product WHERE Id=@Id", Connection))
                {
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

        [HttpGet]
        [Route("Get_Content/{id}")]
        public async Task<JsonResult> Get_Content(uint id)
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
                                Area = SqlReader.GetString(0),
                                Text = SqlReader.GetString(1),
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
        public async Task<JsonResult> Update_Content([FromBody] ProductContentRequest updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();

                using (var Command = new MySqlCommand($"DELETE FROM product_content Where Product_Id = @Product_Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Product_Id", updateData.Product_Id);
                    await Command.ExecuteNonQueryAsync();
                }

                foreach (var content in updateData.ContentList)
                {
                    using (var Command = new MySqlCommand($"INSERT INTO product_content (Product_Id, Area, Text, FileName) VALUES (@Product_Id, @Area, @Text, @FileName)", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Product_Id", MySqlDbType.UInt32).Value = updateData.Product_Id;
                        Command.Parameters.Add("@Area", MySqlDbType.VarChar, 260).Value = content.Area;
                        Command.Parameters.Add("@Text", MySqlDbType.VarChar, 10000).Value = content.Text;
                        Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 1000).Value = content.FileName;
                        await Command.ExecuteNonQueryAsync();
                    }
                }
                using (var Command = new MySqlCommand($"DELETE FROM product_comment Where Product_Id = @Product_Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Product_Id", updateData.Product_Id);
                    await Command.ExecuteNonQueryAsync();
                }

                foreach (var comment in updateData.CommentList)
                {
                    using (var Command = new MySqlCommand($"INSERT INTO product_comment (Product_Id, Pharmacist_Id, Text, Score) VALUES (@Product_Id, @Pharmacist_Id, @Text, @Score)", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Product_Id", MySqlDbType.UInt32).Value = updateData.Product_Id;
                        Command.Parameters.Add("@Pharmacist_Id", MySqlDbType.VarChar, 260).Value = comment.Pharmacist.Id;
                        Command.Parameters.Add("@Text", MySqlDbType.VarChar, 10000).Value = comment.Text;
                        Command.Parameters.Add("@Score", MySqlDbType.VarChar, 1000).Value = comment.Score;
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
        [HttpGet]
        [Route("Get_Comment/{id}")]
        public async Task<JsonResult> Get_Comment(uint id)
        {
            List<ProductCommentModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"SELECT pc.Id, Text, Name, Position, Pharmacy, ph.FileName, ph.Id, Score  FROM product_comment pc JOIN pharmacist ph ON pc.Pharmacist_Id=ph.Id WHERE pc.Product_Id = @Product_Id", Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.AddWithValue("@Product_Id", id);
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Text = SqlReader.GetString(1),
                                Score = SqlReader.GetDecimal(7),
                                Pharmacist = new()
                                {
                                    Id = SqlReader.GetUInt32(6),
                                    Name = SqlReader.GetString(2),
                                    Position = SqlReader.GetString(3),
                                    Pharmacy = SqlReader.GetString(4),
                                    FileName = SqlReader.GetString(5),
                                },
                            });
                        }
                    }
                }
                foreach (var productComment in result)
                {
                    using (var Command = new MySqlCommand($"SELECT Img FROM product_comment_img WHERE Comment_Id = @Comment_Id", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.AddWithValue("@Comment_Id", productComment.Id);
                        using (MySqlDataReader SqlReader = Command.ExecuteReader())
                        {
                            while (SqlReader.Read())
                            {
                                productComment.ImgList.Add(new ImgModel { Img = SqlReader.GetString(0) });
                            }
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
        [Route("Update_DisplayOrder")]
        public async Task<JsonResult> Update_DisplayOrder([FromBody] List<ProductModel> updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                foreach(var product in updateData)
                {
                    using (var Command = new MySqlCommand($"UPDATE product SET DisplayOrder=@DisplayOrder WHERE Id=@Id", Connection))
                    {
                        Command.Parameters.AddWithValue("@Id", product.Id);
                        Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = product.DisplayOrder;
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
    }
}
