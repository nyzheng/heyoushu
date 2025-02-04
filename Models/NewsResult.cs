using heyoushu.Models.Backstage;


namespace heyoushu.Models
{
    
    public class NewsResult
    {
        public List<NewsModel> LatestNews { get; set; } = new List<NewsModel>();
        public List<NewsModel> NewsList { get; set; } = new List<NewsModel>();
    }
    public class NewsContentResult
    {
        public uint News_Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string CreationDate {  get; set; } = string.Empty;
        public List<NewsContentModel> NewsContent { get; set; } = new List<NewsContentModel>();
        public List<NewsModel> LatestNews { get; set; } = new List<NewsModel>();
        public string HeadContent { get; set; } = string.Empty;


    }
}
