using heyoushu.Models.Backstage;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;

namespace heyoushu.Controllers
{
    public class PharmacistController : Controller
    {
        private readonly ILogger<PharmacistController> _logger;
        private readonly IConfiguration _configuration;

        public PharmacistController(ILogger<PharmacistController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }
        private PharmacistProfileResult Get_Profile(string id)
        {
            PharmacistProfileResult result = new();
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"Select Id, Name, Pharmacy , FileName, Position From pharmacist Where Id = {id}", Connection))
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
                using (var Command = new MySqlCommand($"Select Area, DisplayOrder, Text , FileName , TypeSetting From pharmacist_profile Where Pharmacist_Id = {id}", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacistProfile.Add(new()
                            {
                                Pharmacist_Id = Convert.ToUInt32(id),
                                Area = SqlReader.GetString(0),
                                DisplayOrder = SqlReader.GetUInt32(1),
                                Text = SqlReader.GetString(2),
                                FileName = SqlReader.GetString(3),
                                TypeSetting = SqlReader.GetString(4),
                            });

                        }
                    }
                }
                using (var Command = new MySqlCommand($"Select Link1, Link2, Link3 From pharmacist Where Id = {id};", Connection))
                {
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result.PharmacistLink.Link1 = SqlReader.GetString(0);
                            result.PharmacistLink.Link2 = SqlReader.GetString(1);
                            result.PharmacistLink.Link3 = SqlReader.GetString(2);
                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }

        [Route("[controller]/{id?}")]

        public IActionResult Index(string id)
        {
            string Id = string.IsNullOrEmpty(id) ? "1" : id;
            PharmacistProfileResult data = Get_Profile(Id);
            ViewData["title"] = data.Pharmacist.Name;
            return View(data);
        }
    }
}
