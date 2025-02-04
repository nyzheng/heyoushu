using MySqlConnector;

namespace heyoushu.Models.RequiredModel
{
    public static class Heyoushu_Shared
    {
        static readonly int UseOption = 1;

        public static string Get_DataBase_Option()
        {
            if (UseOption == 1)
                return "MySQL-Local";
            else if (UseOption == 2)
                return "MySQL-Server";
            else
                return "MySQL-Local";
        }

        public static string Get_Files_Directory_Option()
        {
            if (UseOption == 1)
                return "DirectoryName-Local";
            else if (UseOption == 2)
                return "DirectoryName-Server";
            else
                return "DirectoryName-Server";
        }

        /// <summary>
        /// 取得後台帳號
        /// </summary>
        /// <param name="connectionStr">資料庫連線字串</param>
        /// <param name="id">AutoId</param>
        /// <returns>UserId(帳號)</returns>
        public static string GetAccount(string? connectionStr, int id)
        {
            string? UserId;

            if (!string.IsNullOrEmpty(connectionStr))
            {
                using (var Connection = new MySqlConnection(connectionStr))
                {
                    string SQLString = $"Select UserId From user_account Where Id={id}";
                    using (var Command = new MySqlCommand(SQLString, Connection))
                    {
                        Connection.Open();
                        UserId = Command.ExecuteScalar()?.ToString();
                    }
                    Connection.Close();
                }
            }
            else
                UserId = "";

            return UserId ?? "";
        }
    }
}
