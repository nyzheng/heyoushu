using heyoushu.Models.Backstage;

namespace heyoushu.Models
{
    public class HomeResult
    {
        public List<PharmacistModel> PharmacistData { get; set; } = new();
        public List<ArticleModel> ArticleData { get; set; } = new();    
        public List<ArticleCategory> CategoryData { get; set; } = new();
        public List<BannerModel2> BannerData { get; set; } = new();
        public List<TiktokModel> TiktokData { get; set; } = new();
        public List<BannerModel> PageData { get; set; } = new();


    }
}
