using heyoushu.Models.Backstage;

namespace heyoushu.Models
{
    public class AboutViewModel
    {
        public List<AboutModel> AboutData { get; set; } = new();

        public List<AboutModel> AboutCategorys { get; set; } = new();
    }
}
