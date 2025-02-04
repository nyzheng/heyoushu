using heyoushu.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace heyoushu.ViewComponents
{
    public class HeaderViewComponent : ViewComponent
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public HeaderViewComponent(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {

            return View();
        }
    }
}
