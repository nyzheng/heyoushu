namespace heyoushu.Models.Backstage
{
    public class ArticleContentResult
    {
        public ArticleModel Article { get; set; } = new ArticleModel();
        public List<ArticleContentModel> ArticleContent { get; set;  } =  new List<ArticleContentModel>();  
        public List<ArticleModel> SameCategoryArticle { get; set; } = new List<ArticleModel>();
        public List<ArticleModel> PopularArticleList { get; set; } = new List<ArticleModel>();

    }
    public class ArticleContentRequest
    {
        public uint Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public List<ArticleContentModel> ArticleContent { get; set; } = new List<ArticleContentModel>();

    }
    public class ArticleContentModel
    {
        public uint DisplayOrder { get; set; }
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string TypeSetting { get; set; } = string.Empty;
    }
}
