using heyoushu.Models.Backstage;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;


using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers
{
    public class LocationController : Controller
    {
        private readonly ILogger<LocationController> _logger;
        private readonly IConfiguration _configuration;

        public LocationController(ILogger<LocationController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public List<PharmacyModel> Get_Data(string id)
        {
            List<PharmacyModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                if(id == "0")
                {
                    using (var Command = new MySqlCommand($"Select Id, PharmacyName, Region_Id, Address, PhoneNumber, FileName, DisplayOrder From pharmacy ORDER BY DisplayOrder;", Connection))
                    {
                        Connection.Open();
                        using (MySqlDataReader SqlReader = Command.ExecuteReader())
                        {
                            while (SqlReader.Read())
                            {
                                result.Add(new()
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
                if (id != "0")
                {
                    using (var Command = new MySqlCommand($"Select Id, PharmacyName, Region_Id, Address, PhoneNumber, FileName, DisplayOrder From pharmacy Where Region_Id={Convert.ToUInt32(id)} ORDER BY DisplayOrder;", Connection))
                    {
                        Connection.Open();
                        using (MySqlDataReader SqlReader = Command.ExecuteReader())
                        {
                            while (SqlReader.Read())
                            {
                                result.Add(new()
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
            }

            return result;
        }
        public List<RegionModel> Get_Region()
        {
            List<RegionModel> result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
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


        [Route("Location/{id?}")]
        public IActionResult Index(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "0" : id;
            PharmacyResult data = new()
            {
                PharmacyList = Get_Data(Id),
                RegionList = Get_Region(),
            };
            ViewData["id"] = Id;
            ViewData["Title"] = "北中南藥局";

            return View(data);
        }

        [Route("[controller]/Map")]
        public IActionResult Map()
        {
            ViewData["Title"] = "全台分布位置";
            return View();
        }
    }
}
