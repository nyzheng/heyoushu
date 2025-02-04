using Microsoft.AspNetCore.Mvc;
using heyoushu.Models.RequiredModel;
using MySqlConnector;
using heyoushu.Models.Backstage;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;
using Microsoft.AspNetCore.Authorization;

namespace heyoushu.Backstage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // 匿名
    public class PharmacistController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊
        private readonly ILogger<PharmacistController> _logger; // 加入 logger
        public PharmacistController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<PharmacistController> logger)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; // 初始化 logger
        }
        [HttpGet]
        [Route("Get_Data")]
        public async Task<JsonResult> Get_Data()
        {
            PharmacistResult result = new();

            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT pharmacist.Id, Name, Pharmacy , DisplayOrder, region.Region FROM pharmacist JOIN region ON pharmacist.Region_Id = region.Id ORDER BY DisplayOrder", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacistList.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Name = SqlReader.GetString(1),
                                Pharmacy = SqlReader.GetString(2),
                                DisplayOrder = SqlReader.GetUInt32(3),
                                Region = SqlReader.GetString(4),
                            });
                        }
                    }
                }
                    Connection.Close();
            }

            result.RegionList = await Get_Region();

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpPost]
        [Route("Update_Data")]
        public async Task<JsonResult> Update_Data([FromBody] PharmacistModel pharmacist)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update pharmacist Set  Name=@Name , Pharmacy=@Pharmacy , FileName=@FilaName Where Id={pharmacist.Id};", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Name", MySqlDbType.VarChar, 260).Value = pharmacist.Name;
                    Command.Parameters.Add("@Pharmacy", MySqlDbType.VarChar, 260).Value = pharmacist.Pharmacy;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = pharmacist.FileName;

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
        [Route("Create_Data")]
        public async Task<JsonResult> Create_Data([FromBody] PharmacistModel pharmacist)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Insert Into pharmacist (Name , FileName ,Position , Pharmacy , Region_Id, DisplayOrder) values (@Name , @FileName ,@Position, @Pharmacy , @Region_Id, @DisplayOrder);", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Name", MySqlDbType.VarChar, 260).Value = pharmacist.Name;
                    Command.Parameters.Add("@Position", MySqlDbType.VarChar, 260).Value = pharmacist.Position;
                    Command.Parameters.Add("@Pharmacy", MySqlDbType.VarChar, 260).Value = pharmacist.Pharmacy;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = pharmacist.FileName; 
                    Command.Parameters.Add("@Region_Id", MySqlDbType.UInt32).Value = pharmacist.Region_Id;
                    Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = pharmacist.DisplayOrder;
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
        public async Task<JsonResult> Delete_Data([FromBody] PharmacistModel deleteData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Delete From pharmacist Where Id = @Id", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.VarChar, 260).Value = deleteData.Id;



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
        [Route("Get_Pharmacist/{Region_Id}")]
        public async Task<JsonResult> Get_Pharmacist(uint Region_Id)
        {
            PharmacistResult result = new();

            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, Name, Pharmacy , FileName, Region_Id, Position From pharmacist Where Region_Id = {Region_Id} ORDER BY DisplayOrder", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacistList.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Name = SqlReader.GetString(1),
                                Pharmacy = SqlReader.GetString(2),
                                FileName = SqlReader.GetString(3),
                                Region_Id = SqlReader.GetUInt32(4),
                                Position = SqlReader.GetString(5),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            result.RegionList = await Get_Region();

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpGet]
        [Route("Get_Profile/{Id}")]
        public async Task<JsonResult> Profile(uint Id)
        {
            PharmacistProfileResult result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, Name, Pharmacy , FileName, Position From pharmacist Where Id = {Id}", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Pharmacist.Id = SqlReader.GetUInt32(0);
                            result.Pharmacist.Name = SqlReader.GetString(1);
                            result.Pharmacist.Pharmacy = SqlReader.GetString(2);
                            result.Pharmacist.FileName = SqlReader.GetString(3);
                            result.Pharmacist.Position = SqlReader.GetString(4);
                        }
                    }
                }
                using (var Command = new MySqlCommand($"Select Area, DisplayOrder, Text , FileName , TypeSetting From pharmacist_profile Where Pharmacist_Id = {Id}", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacistProfile.Add(new()
                            {
                                Pharmacist_Id = Id,
                                Area = SqlReader.GetString(0),
                                DisplayOrder = SqlReader.GetUInt32(1),
                                Text = SqlReader.GetString(2),
                                FileName = SqlReader.GetString(3),
                                TypeSetting = SqlReader.GetString(4),
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
        [Route("Update_Profile")]
        public async Task<JsonResult> Update_Profile([FromBody] PharmacistProfileRequest updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update pharmacist Set Name = @Name , FileName = @FileName, Position = @Position, Pharmacy = @Pharmacy Where Id = {updateData.Id}", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Name", MySqlDbType.VarChar, 260).Value = updateData.Name;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;
                    Command.Parameters.Add("@Position", MySqlDbType.VarChar, 260).Value = updateData.Position;
                    Command.Parameters.Add("@Pharmacy", MySqlDbType.VarChar, 260).Value = updateData.Pharmacy;

                    await Command.ExecuteNonQueryAsync();
                }

                using (var Command = new MySqlCommand($"Delete From pharmacist_profile Where Pharmacist_Id = {updateData.Id}", Connection))
                {
                    await Command.ExecuteNonQueryAsync();
                }

                foreach (var profile in updateData.PharmacistProfile)
                {
                    using (var Command = new MySqlCommand($"Insert Into pharmacist_profile (Pharmacist_Id , DisplayOrder , Text , FileName , TypeSetting , Area) values (@Pharmacist_Id , @DisplayOrder , @Text , @FileName , @TypeSetting , @Area) ", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Pharmacist_Id", MySqlDbType.UInt32).Value = updateData.Id;
                        Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = profile.DisplayOrder;
                        Command.Parameters.Add("@Text", MySqlDbType.VarChar, 10000).Value = profile.Text;
                        Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = profile.FileName;
                        Command.Parameters.Add("@TypeSetting", MySqlDbType.VarChar, 260).Value = profile.TypeSetting;
                        Command.Parameters.Add("@Area", MySqlDbType.VarChar, 260).Value = profile.Area;


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
        [Route("Update_DisplayOrder")]
        public async Task<JsonResult> Update_Data([FromBody] List<OrderModel> data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                        Connection.Open();
                foreach (var item in data)
                {
                    using (var Command = new MySqlCommand($"Update pharmacist Set  DisplayOrder=@DisplayOrder Where Id=@Id;", Connection))
                    {
                        Command.Parameters.Clear();
                        Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = item.Id;
                        Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = item.DisplayOrder;

                        Command.ExecuteNonQuery();

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

        public async Task<List<RegionModel>> Get_Region()
        {
            List<RegionModel> result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, Region From region", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Region = SqlReader.GetString(1),
                            });

                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }

        [HttpPost]
        [Route("UpdatePharmacistRegion")]
        public async Task<JsonResult> Update_PharmacistRegion([FromBody] PharmacistModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update pharmacist Set Region_Id=@Region_Id Where Id=@Id;", Connection))
                {
                    Connection.Open();

                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = data.Id;
                    Command.Parameters.Add("@Region_Id", MySqlDbType.UInt32).Value = data.Region_Id;

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
        [Route("Get_Homepage_Data")]
        public async Task<JsonResult> Get_Homepage_Data()
        {
            List<PharmacistModel> result = new();

            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT pharmacist.Id, Name, Pharmacy, FileName, Position FROM pharmacist ORDER BY DisplayOrder LIMIT 4", Connection))
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
                                FileName = SqlReader.GetString(3),
                                Position = SqlReader.GetString(4),
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
        [Route("Get_Link/{Id}")]
        public async Task<JsonResult> Get_Link(string Id)
        {
            PharmacistLinkModel result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Link1, Link2, Link3 From pharmacist Where Id = {Convert.ToUInt32(Id)};", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Link1 = SqlReader.GetString(0);
                            result.Link2 = SqlReader.GetString(1);
                            result.Link3 = SqlReader.GetString(2);
                        }
                    }
                }
                Connection.Close();
            }
            return new JsonResult(new ReturnJson()
            {
                Data= result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpPost]
        [Route("Update_Link")]
        public async Task<JsonResult> Update_Link([FromBody] PharmacistLinkRequest updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update pharmacist Set  Link1=@Link1 , Link2=@Link2 , Link3=@Link3 Where Id=@Id;", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Id", MySqlDbType.UInt32).Value = updateData.Id;
                    Command.Parameters.Add("@Link1", MySqlDbType.VarChar, 260).Value = updateData.PharmacistLink.Link1;
                    Command.Parameters.Add("@Link2", MySqlDbType.VarChar, 260).Value = updateData.PharmacistLink.Link2;
                    Command.Parameters.Add("@Link3", MySqlDbType.VarChar, 260).Value = updateData.PharmacistLink.Link3;

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
        [Route("Get_PharmacistList")]
        public async Task<JsonResult> Get_PharmacistList()
        {
            PharmacistResult result = new();

            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Id, Name, FileName, Position, Pharmacy FROM pharmacist ORDER BY DisplayOrder", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacistList.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                Name = SqlReader.GetString(1),
                                FileName = SqlReader.GetString(2),
                                Position = SqlReader.GetString(3),
                                Pharmacy = SqlReader.GetString(4),
                            });
                        }
                    }
                }
                Connection.Close();
            }
            result.RegionList = await Get_Region();

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpGet]
        [Route("Get_PharmacistData/{Id}")]
        public async Task<JsonResult> Get_PharmacistData(uint Id)
        {
            PharmacistModel result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                using (var Command = new MySqlCommand($"Select Name, Pharmacy , FileName, Position From pharmacist Where Id = {Id}", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.Name = SqlReader.GetString(0);
                            result.Pharmacy = SqlReader.GetString(1);
                            result.FileName = SqlReader.GetString(2);
                            result.Position = SqlReader.GetString(3);
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
    }
}