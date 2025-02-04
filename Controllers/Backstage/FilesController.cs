using Microsoft.AspNetCore.Mvc;
using heyoushu.Models.RequiredModel;
using Microsoft.AspNetCore.Authorization;
using heyoushu.Models.Backstage;
using AngleSharp.Io;

namespace heyoushu.Backstage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // 匿名
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        public FilesController(IWebHostEnvironment env, IConfiguration configuration)
        {
            _env = env;
            _configuration = configuration;
        }
        private string GetRootPath()
        {
            var appRootPath = _env.ContentRootPath;
            var frontendStaticPath = Path.Combine(appRootPath, "wwwroot", "upload", "images");

            return frontendStaticPath.TrimEnd(Path.DirectorySeparatorChar);
        }

        #region Upload

        [HttpPost]
        [Route("Upload")]
        public async Task<JsonResult> Upload()
        {
            var data = Request.Form.Files["data"];
            var fileName = Request.Form["fileName"];
            var index = Request.Form["index"];
            string rootPath = GetRootPath();
            string tempPath = Path.Combine(rootPath, fileName + "_"); // 暫存資料夾

            try
            {
                if (!Directory.Exists(tempPath))
                    Directory.CreateDirectory(tempPath);

                if (!Convert.IsDBNull(data))
                {
                    using (var stream = new FileStream(Path.Combine(tempPath, index.ToString()), FileMode.Create))
                    {
                        await data.CopyToAsync(stream);
                    }

                    return new JsonResult(new ReturnJson()
                    {
                        HttpCode = 200,
                        Message = "OK"
                    });
                }
                else
                {
                    return new JsonResult(new ReturnJson()
                    {
                        HttpCode = 400,
                        Message = "找不到檔案!"
                    });
                }
            }
            catch (Exception ex)
            {
                return new JsonResult(new ReturnJson()
                {
                    HttpCode = 400,
                    Message = ex.Message
                });
            }
        }

        #endregion

        [HttpPost]
        [Route("CreateSmall")]
        public async Task<JsonResult> CreateSmall()
        {

            var data = Request.Form.Files["data"];
            var fileName = Request.Form["fileName"];

            try
            {
                if (!Convert.IsDBNull(data))
                {
                    string rootPath = GetRootPath();

                    using (var stream = new FileStream(Path.Combine(rootPath, fileName), FileMode.Create))
                    {
                        await data.CopyToAsync(stream);
                    }

                    return new JsonResult(new ReturnJson()
                    {
                        HttpCode = 200,
                        Message = "OK"
                    });
                }
                else
                {
                    return new JsonResult(new ReturnJson()
                    {
                        HttpCode = 400,
                        Message = "找不到檔案!"
                    });
                }
            }
            catch (Exception ex)
            {
                return new JsonResult(new ReturnJson()
                {
                    HttpCode = 200,
                    Message = ex.Message
                });
            }
        }
        [HttpPost]
        [Route("Create")]
        public async Task<JsonResult> Create([FromBody] FileList fileList)
        {
            if (fileList != null && fileList.FileName != null && fileList.FileName != "")
            {
                try
                {
                    string rootPath = GetRootPath();
                    string tempPath = Path.Combine(rootPath, fileList.FileName + "_"); // 暫存資料夾

                    using (var stream = new FileStream(Path.Combine(rootPath, fileList.FileName), FileMode.Create))
                    {
                        for (uint i = 1; i <= 100; i++)
                        {
                            var bytes = System.IO.File.ReadAllBytes(Path.Combine(tempPath, i.ToString()));
                            await stream.WriteAsync(bytes.AsMemory(0, bytes.Length));
                            bytes = null;
                        }
                    }

                    Directory.Delete(tempPath, true);

                    return new JsonResult(new ReturnJson()
                    {
                        HttpCode = 200,
                        Message = "OK"
                    });
                }
                catch (Exception ex)
                {
                    return new JsonResult(new ReturnJson()
                    {
                        HttpCode = 400,
                        Message = ex.Message
                    });
                }
            }
            else
            {
                return new JsonResult(new ReturnJson()
                {
                    HttpCode = 400,
                    Message = "值不能為空!"
                });
            }
        }
        #region 讀取 圖片


        public bool CheckImgExtension(string FileExtension) => FileExtension switch
        {
            ".webp" => true,
            ".jpg" => true,
            ".jpeg" => true,
            ".jfif" => true,
            ".png" => true,
            ".ico" => true,
            ".svg" => true,
            ".gif" => true,
            _ => false,
        };


        #region GetImgs

        [HttpPost]
        [Route("GetImgs")]
        public async Task<JsonResult> GetImgs([FromBody] PageNum pageNum)
        {
            List<ImageList> result = new();

            await Task.Run(() =>
            {
                uint PaginationCount = 50; // 分頁數
                string path = GetRootPath();

                var Files = new DirectoryInfo(path).EnumerateFiles().OrderByDescending(f => f.LastWriteTime);

                uint MinNum = (pageNum.Num - 1) * PaginationCount + 1;
                uint MaxNum = pageNum.Num * PaginationCount;

                if (pageNum.Num > 0 & MinNum <= Files.Count())
                {
                    uint Index = 1;

                    foreach (var file in Files)
                    {
                        if (Index > MaxNum)
                            break;

                        if (CheckImgExtension(file.Extension.ToLower()))
                        {
                            if (Index >= MinNum & Index <= MaxNum)
                            {
                                if (file.Name != "loading.webp")
                                {
                                    result.Add(new()
                                    {
                                        Id = Index,
                                        FileName = file.Name,
                                        ModifiedDate = file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss"),
                                    });
                                }
                            }

                            Index += 1;
                        }
                    }
                }
            });

            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        #endregion
        #endregion


        [HttpPost]
        [Route("CheckExistence")]
        public JsonResult CheckExistence()
        {
            var fileName = Request.Form["fileName"];
            string rootPath = GetRootPath();
            var targetFilePath = Path.Combine(rootPath, fileName);
            bool result = System.IO.File.Exists(targetFilePath);
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
        [HttpPost]
        [Route("ChangeFileName")]
        public JsonResult ChangeFileName([FromBody] string fileName)
        {
            var guid = Guid.NewGuid();
            string result = $"{fileName}-{guid}";
            return new JsonResult(new ReturnJson()
            {
                Data = result,
                HttpCode = 200,
                Message = "OK"
            });
        }
    }
}