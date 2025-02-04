namespace heyoushu.Models.RequiredModel
{
    public class ReturnJson
    {
        public dynamic Data { get; set; } = string.Empty;

        public uint HttpCode { get; set; }

        public dynamic Message { get; set; } = string.Empty;
    }
}
