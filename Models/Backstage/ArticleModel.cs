namespace heyoushu.Models.Backstage
{
    public class ArticleResult
    {
        public List<ArticleModel> FeaturedArticle { get; set; } = new List<ArticleModel>();
        public List<ArticleModel> PopularArticleList { get; set; } = new List<ArticleModel>();
        public List<ArticleModel> ArticleList { get; set; } = new List<ArticleModel>();
        public List<ArticleCategory> CategoryList { get; set; } = new List<ArticleCategory>();   


    }
    public class ArticleModel
    {
        public uint Id { get; set; }
        public uint Category_Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public uint Popularity { get; set; } =  0;
        public string CreationDate {  get; set; } = string.Empty;
        public List<string> ArticleTag { get; set; } = new List<string>();
        public string HeadContent { get; set; } = string.Empty;

    }
    public class ArticleCategory
    {
        public uint Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }


}
