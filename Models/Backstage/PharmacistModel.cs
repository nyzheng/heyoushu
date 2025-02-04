namespace heyoushu.Models.Backstage
{

    public class PharmacistResult
    {
        public List<PharmacistModel> PharmacistList { get; set; } = new List<PharmacistModel>();
        public List<RegionModel> RegionList { get; set; } = new List<RegionModel>();

    }
    public class PharmacistModel
    {
        public uint Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Pharmacy { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public uint DisplayOrder { get; set; }
        public string Region { get; set; } = string.Empty;
        public uint Region_Id { get; set; }
    }
    public class PharmacistProfileResult
    {
        public PharmacistModel Pharmacist { get; set; } = new PharmacistModel();
        public List<PharmacistProfileModel> PharmacistProfile { get; set; } = new List<PharmacistProfileModel>();
        public PharmacistLinkModel PharmacistLink { get; set; }= new PharmacistLinkModel();
    }
    public class PharmacistLinkRequest
    {
        public uint Id { get; set; }
        public PharmacistLinkModel PharmacistLink { get; set; } = new PharmacistLinkModel();
    }
    public class PharmacistLinkModel
    {
        public string Link1 { get; set; } = string.Empty;
        public string Link2 { get; set; } = string.Empty;
        public string Link3 { get; set; } = string.Empty;
    }
    public class PharmacistProfileModel
    {
        public uint Pharmacist_Id { get; set; }
        public string Area { get; set; } = string.Empty;
        public uint DisplayOrder { get; set; }
        public string Text { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string TypeSetting { get; set; } = string.Empty;
    }

    public class PharmacistProfileRequest
    {
        public uint Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Pharmacy { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public List<PharmacistProfileModel> PharmacistProfile { get; set; } = new List<PharmacistProfileModel>();

    }
    public class OrderModel
    {
        public uint Id { get; set; }
        public uint DisplayOrder { get; set; }
    }
}
