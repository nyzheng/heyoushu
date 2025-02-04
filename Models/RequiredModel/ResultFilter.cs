using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace heyoushu.Models.RequiredModel
{
    public class ResultFilter : IResultFilter
    {
        public void OnResultExecuted(ResultExecutedContext context)
        {

        }

        public void OnResultExecuting(ResultExecutingContext context)
        {
            //if (context.Result is JsonResult)
            //{
            //    var jsonResult = context.Result as JsonResult;

            //    if (context.ModelState.IsValid)
            //    {
            //        context.Result = new JsonResult(new ReturnJson()
            //        {
            //            Data = jsonResult.Value
            //        });
            //    }
            //    else
            //    {
            //        context.Result = new JsonResult(new ReturnJson()
            //        {
            //            Error = jsonResult.Value
            //        });
            //    }
            //}

            if (context.Result is ObjectResult)
            {
                var objectResult = context.Result as ObjectResult;

                if (context.ModelState.IsValid)
                {
                    context.Result = new JsonResult(new ReturnJson()
                    {
                        Data = objectResult.Value
                    });
                }
                else
                {
                    var problemDetails = (ValidationProblemDetails)objectResult.Value;
                    string errorMessage = "您輸入的資料不正確";

                    if (problemDetails != null && problemDetails.Errors.Count > 0)
                        errorMessage = problemDetails.Errors.First().Value[0];

                    context.Result = new JsonResult(new ReturnJson()
                    {
                        HttpCode = 400,
                        Message = errorMessage
                    });
                }
            }
        }
    }
}
