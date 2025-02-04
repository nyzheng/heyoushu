using heyoushu.Controllers;
using heyoushu.Models.Backstage;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using static heyoushu.Models.RequiredModel.Heyoushu_Shared;


namespace heyoushu.ViewComponents
{
    public class FooterViewComponent : ViewComponent
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public FooterViewComponent(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        private string Get_Data()
        {
            string result = "";
            using (var Connection = new MySqlConnection(_configuration[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                using (var Command = new MySqlCommand($"SELECT Text FROM footer WHERE Id = 1", Connection))
                {
                    Connection.Open();
                    using (MySqlDataReader SqlReader = Command.ExecuteReader())
                    {
                        while (SqlReader.Read())
                        {
                            result = SqlReader.GetString(0);
                        }
                    }
                }
                Connection.Close();
            }
            return result;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            FooterResult data = new()
            {
                Text = Get_Data(),
            };
            return View(data);
        }
    }
}
