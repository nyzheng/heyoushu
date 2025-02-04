using heyoushu.Models.Backstage;

namespace heyoushu.Models
{
    public class ForumResult
    {
        public List<BannerModel> BannerList { get; set; } = new List<BannerModel>();
        public List<CategoryModel> CategoryList { get; set; } = new List<CategoryModel>();
        public List<ForumQuestionModel> QuestionList { get; set; } = new List<ForumQuestionModel>();
    }
    public class ForumQuestionModel
    {
        public uint Id { get; set; }
        public uint Category_Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool Acceptance { get; set; } = false;
        public List<ForumAnswerModel> AnswerList { get; set; } = new List<ForumAnswerModel>();
    }
    public class ForumAnswerModel
    {
        public uint Id { get; set; }
        public uint Question_Id { get; set; }
        public bool Official { get; set; } = false;
        public uint Pharmacist_Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Pharmacy { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
