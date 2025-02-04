namespace heyoushu.Models.Backstage
{
    public class AboutModel
    {
        public uint Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string TypeSetting { get; set; } = string.Empty;
        public uint DisplayOrder { get; set; }
    }
    public class CategoryModel
    {
        public uint Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
    public class AboutResult
    {
        public List<AboutModel> AboutData { get; set; } = new List<AboutModel>();
        public List<CategoryModel> AboutCategory { get; set; } = new List<CategoryModel>();
    }
    public class AboutRequest
    {
        public List<AboutModel> AboutData { get; set; } = new List<AboutModel>();
    }
}
