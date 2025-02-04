namespace heyoushu.Models.Backstage
{
    public class NewsModel
    {
        public uint Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string CreationDate { get; set; } = string.Empty;
        public string HeadContent {  get; set; } = string.Empty;
    }

    public class NewsContentModel
    {
        public uint Id { get; set; }
        public uint News_Id { get; set; }   
        public uint DisplayOrder { get; set; }
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string TypeSetting { get; set; } = string.Empty;
    }
}
