using heyoushu.Models.Backstage;

namespace heyoushu.Models
{
    public class ProductResult
    {
        public List<PageDataModel> PageDataList { get; set; } = new List<PageDataModel>();
        public List<ProductModel> ProductList { get; set; } = new List<ProductModel>();

    }
    public class ProductModel
    {
        public uint Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public decimal Score { get; set; } = decimal.MaxValue;
        public uint Popularity { get; set; } 
        public string Tag { get; set; } = string.Empty;
        public uint DisplayOrder {  get; set; }
    }   
    public class ProductContentResult
    {
        public List<PageDataModel> PageDataList { get; set; } = new List<PageDataModel>();
        public List<ProductContentModel> ContentList { get; set; } = new List<ProductContentModel>();
        public List<ProductCommentModel> CommentList { get; set; } = new List<ProductCommentModel>();
    }
    public class ProductContentRequest
    {
        public uint Product_Id { get; set; }
        public List<ProductContentModel> ContentList { get; set; } = new List<ProductContentModel>();
        public List<ProductCommentModel> CommentList { get; set; } = new List<ProductCommentModel>();
    }
    public class ProductContentModel
    {
        public uint Product_Id { get; set; }
        public string Area { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }
    public class ProductCommentModel
    {
        public uint Id { get; set; }
        public uint Product_Id { get; set; }
        public PharmacistModel Pharmacist { get; set; } = new PharmacistModel();
        public string TypeSetting { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public List<ImgModel> ImgList { get; set; } = new List<ImgModel>();
        public decimal Score { get; set; } = 0;
    }
    public class ImgModel
    {
        public string Img { get; set; } = string.Empty;
    }
        
}

