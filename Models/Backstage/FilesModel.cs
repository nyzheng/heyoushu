namespace heyoushu.Models.Backstage
{
    public class FileList
    {
        public string FileName { get; set; } = string.Empty;
    }

    public class PageNum
    {
        public uint Num { get; set; }
    }

    public class ImageList
    {
        public uint Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string ModifiedDate { get; set; } = string.Empty;
    }
}
