namespace heyoushu.Models.Backstage
{
    public class HomepageResult
    {
        public HomepageResult()
        {
            Banner = string.Empty;
            VideoList = new List<string>();
            PharmacistList = new List<PharmacistModel>();
            ArticleList = new List<ArticleModel>();
        }
        public string Banner { get; set; } = string.Empty;
        public List<string> VideoList { get; set; }
        public List<PharmacistModel> PharmacistList { get; set; }
        public List<ArticleModel> ArticleList { get; set; }
    }

    


}
