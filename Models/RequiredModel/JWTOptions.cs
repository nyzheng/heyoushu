namespace heyoushu.Models.RequiredModel
{
    public class JWTOptions
    {
        public string Secret { get; set; } = string.Empty;

        public string Issuer { get; set; } = string.Empty;

        public string Audience { get; set; } = string.Empty;
    }
}
