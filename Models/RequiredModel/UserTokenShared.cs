using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using static heyoushu.Models.RequiredModel.Heyoushu_Shared; // 共用

namespace heyoushu.Models.RequiredModel
{
    public class UserTokenShared
    {
        /// <summary>
        /// 創建後台新的Token
        /// </summary>
        /// <param name="userClaim">包含 Id，Email，RoleName</param>
        /// <param name="ipAddress">IP地址</param>
        /// <returns></returns>
        public static Dictionary<string, string> CreateJwtToken(List<UserClaim> userClaim, string ipAddress)
        {
            var ExpiryDate = DateTime.Now.AddMinutes(int.Parse(ConfigurationManager.AppSetting["JWT:ExpiryDate"]!)); // 分鐘

            List<Claim> claims = new()
            {
                new Claim("UserId", userClaim[0].Id ??= ""),
                new Claim(JwtRegisteredClaimNames.Email, ""), // userClaim[0].Email
                new Claim("IPAddress", ipAddress),
            };

            string[] RolesList = userClaim[0].RoleName.Split("_");

            foreach (var item in RolesList)
            {
                claims.Add(new Claim(ClaimTypes.Role, item));
            }

            SymmetricSecurityKey securityKey = new(Encoding.UTF8.GetBytes(ConfigurationManager.AppSetting["JWT:Secret"]!));

            JwtSecurityToken securityToken = new(
                issuer: ConfigurationManager.AppSetting["JWT:Issuer"], // 發行者
                audience: ConfigurationManager.AppSetting["JWT:Audience"], // 使用者
                claims,
                expires: ExpiryDate, // 到期(分鐘)
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
            );

            var AccessToken = new JwtSecurityTokenHandler().WriteToken(securityToken);

            Dictionary<string, string> result = new()
            {
                { "AccessToken", AccessToken },
            };

            return result;
        }


        /// <summary>
        /// 新增Token黑名單
        /// </summary>
        /// <param name="accessToken">Token</param>
        /// <param name="expiryDate">Token中的過期時間</param>
        /// <returns></returns>
        public async static Task<string> CreateBlackToken(string accessToken, DateTime expiryDate)
        {
            await using (var Connection = new MySqlConnection(ConfigurationManager.AppSetting[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                string SQLString = "Insert Into user_black_token (Token, ExpiryDate) values (@Token, @ExpiryDate);";
                using (var Command = new MySqlCommand(SQLString, Connection))
                {
                    Command.Parameters.Clear();
                    Command.Parameters.Add("@Token", MySqlDbType.VarChar, 300).Value = accessToken;
                    Command.Parameters.Add("@ExpiryDate", MySqlDbType.DateTime).Value = expiryDate;

                    Connection.Open();
                    Command.ExecuteNonQuery();
                }
                Connection.Close();
            }

            return "OK";
        }


        /// <summary>
        /// 刪除過期的Token黑名單
        /// </summary>
        /// <returns>OK</returns>
        public async static Task<string> DeleteExpiredBlackToken()
        {
            await using (var Connection = new MySqlConnection(ConfigurationManager.AppSetting[$"ConnectionStr:{Get_DataBase_Option()}"]))
            {
                string SQL1 = $"SET SQL_SAFE_UPDATES=0;Delete From user_black_token Where ExpiryDate < '{DateTime.Now:yyyy/MM/dd HH:mm:ss}';SET SQL_SAFE_UPDATES=1;";
                string SQL2 = $"ALTER TABLE user_black_token DROP COLUMN Id;";
                string SQL3 = $"ALTER TABLE user_black_token ADD COLUMN Id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT FIRST, ADD UNIQUE INDEX Id_UNIQUE (Id ASC);";
                using (var Command = new MySqlCommand($"{SQL1}{SQL2}{SQL3}", Connection))
                {
                    Connection.Open();
                    Command.ExecuteNonQuery();
                }
                Connection.Close();
            }

            return "OK";
        }
    }
}
