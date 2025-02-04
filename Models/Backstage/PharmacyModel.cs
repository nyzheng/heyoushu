namespace heyoushu.Models.Backstage
{
    public class PharmacyResult
    {
        public List<PharmacyModel> PharmacyList { get; set;} = new List<PharmacyModel>();
        public List<RegionModel> RegionList { get; set;} =  new List<RegionModel>();

    }
    public class PharmacyModel
    {
        public uint Id { get; set; }
        public string PharmacyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public uint Region_Id { get; set; }
        public string Region {  get; set; } = string.Empty; 

        public uint DisplayOrder { get; set; }  
    }

    public class RegionModel
    {
        public uint Id { get; set; }
        public string Region { get; set; } = string.Empty;
    }
}
