namespace heyoushu.Models.Backstage
{
    public class BannerModel
    {
        public uint Id { get; set; }
        public string FileName { get; set; } = string.Empty;
    }
    public class PageDataModel
    {
        public uint Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
    }
    public class BannerModel2
    {
        public uint Id { get; set; }
        public string Img { get; set; } = string.Empty;
        public string Device { get; set; } = string.Empty;
    }
}
