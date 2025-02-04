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
    public class PharmacyController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor; // 取得使用者資訊

        public PharmacyController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        [Route("Get_Data/{Region_Id}")]
        public async Task<JsonResult> Get_Data(uint Region_Id)
        {
            PharmacyResult result = new(); 
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, PharmacyName, Region_Id , Address , PhoneNumber , FileName , DisplayOrder From pharmacy Where Region_Id = {Region_Id} ORDER BY DisplayOrder", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacyList.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                PharmacyName = SqlReader.GetString(1),
                                Region_Id = SqlReader.GetUInt32(2),
                                Address = SqlReader.GetString(3),
                                PhoneNumber = SqlReader.GetString(4),
                                FileName = SqlReader.GetString(5),
                                DisplayOrder = SqlReader.GetUInt32(6),
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
        [Route("Get_AllData/")]
        public async Task<JsonResult> Get_AllData(uint Region_Id)
        {
            PharmacyResult result = new();
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select pharmacy.Id, PharmacyName, Region , Address , PhoneNumber , FileName , DisplayOrder From pharmacy Join region r On Region_Id = r.Id ORDER BY DisplayOrder", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacyList.Add(new()
                            {
                                Id = SqlReader.GetUInt32(0),
                                PharmacyName = SqlReader.GetString(1),
                                Region = SqlReader.GetString(2),
                                Address = SqlReader.GetString(3),
                                PhoneNumber = SqlReader.GetString(4),
                                FileName = SqlReader.GetString(5),
                                DisplayOrder = SqlReader.GetUInt32(6),
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
        public async Task<JsonResult> Update_Data([FromBody] PharmacyModel updateData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update pharmacy Set PharmacyName = @PharmacyName , FileName = @FileName , Address = @Address , PhoneNumber = @PhoneNumber Where Id = {updateData.Id}", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@PharmacyName", MySqlDbType.VarChar, 260).Value = updateData.PharmacyName;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = updateData.FileName;
                    Command.Parameters.Add("@Address", MySqlDbType.VarChar, 260).Value = updateData.Address;
                    Command.Parameters.Add("@PhoneNumber", MySqlDbType.VarChar, 260).Value = updateData.PhoneNumber;


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
        [Route("Create_Data")]
        public async Task<JsonResult> Create_Data([FromBody] PharmacyModel createData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Insert Into pharmacy (PharmacyName,Region_Id,FileName,Address,PhoneNumber,DisplayOrder) values (@PharmacyName,@Region_Id,@FileName,@Address,@PhoneNumber,@DisplayOrder)", Connection))
                {
                    Connection.Open();
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@PharmacyName", MySqlDbType.VarChar, 260).Value = createData.PharmacyName;
                    Command.Parameters.Add("@Region_Id", MySqlDbType.VarChar, 260).Value = createData.Region_Id;
                    Command.Parameters.Add("@FileName", MySqlDbType.VarChar, 260).Value = createData.FileName;
                    Command.Parameters.Add("@Address", MySqlDbType.VarChar, 260).Value = createData.Address;
                    Command.Parameters.Add("@PhoneNumber", MySqlDbType.VarChar, 260).Value = createData.PhoneNumber;
                    Command.Parameters.Add("@DisplayOrder", MySqlDbType.UInt32).Value = createData.DisplayOrder;



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
        public async Task<JsonResult> Delete_Data([FromBody] PharmacyModel deleteData)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Delete From pharmacy Where Id = @Id", Connection))
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
        [HttpPost]
        [Route("Update_DisplayOrder")]
        public async Task<JsonResult> Update_Data([FromBody] List<OrderModel> data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                Connection.Open();
                foreach (var item in data)
                {
                    using (var Command = new MySqlCommand($"Update pharmacy Set  DisplayOrder=@DisplayOrder Where Id=@Id;", Connection))
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
        [Route("UpdatePharmacyRegion")]
        public async Task<JsonResult> Update_PharmacyRegion([FromBody] PharmacyModel data)
        {
            await using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Update pharmacy Set Region_Id=@Region_Id Where Id=@Id;", Connection))
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
    }
}
