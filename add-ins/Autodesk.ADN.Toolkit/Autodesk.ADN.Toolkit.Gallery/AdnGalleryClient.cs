using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using RestSharp;

namespace Autodesk.ADN.Toolkit.Gallery
{
    public class AdnGalleryClient
    {
        private RestClient _restClient;

        /////////////////////////////////////////////////////////////////////////////////
        // Constructor
        //
        /////////////////////////////////////////////////////////////////////////////////
        public AdnGalleryClient(string serviceUrl)
        { 
            _restClient = new RestClient(serviceUrl);     
        }

        async public Task<DBModelListResponse> GetModelsAsync()
        {
            var request = new RestRequest(
                "api/models",
                Method.GET);

            request.AddHeader("Content-Type", "application/json");

            return await _restClient.ExecuteAsync
                <DBModelListResponse>(
                    request);
        }

        async public Task<DBModelResponse> AddModelAsync(DBModel model)
        {
            var request = new RestRequest(
                "api/model", 
                Method.POST);

            request.AddHeader("Content-Type", "application/json");

            var payload = JsonConvert.SerializeObject(model);

            request.AddParameter("application/json",
                payload,
                ParameterType.RequestBody);

            return await _restClient.ExecuteAsync
                <DBModelResponse>(
                    request);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Custom Extensions for RestClient
    //
    /////////////////////////////////////////////////////////////////////////////////
    public static class RestClientExtensions
    {
        public static async Task<IRestResponse> ExecuteAsync(
            this RestClient client,
            RestRequest request)
        {
            return await Task<IRestResponse>.Factory.StartNew(() =>
            {
                return client.Execute(request);
            });
        }

        public static async Task<T> ExecuteAsync<T>(
            this RestClient client,
            RestRequest request) where T : new()
        {
            return await Task<T>.Factory.StartNew(() =>
            {
                try
                {
                    IRestResponse httpResponse = client.Execute(request);

                    if (httpResponse.StatusCode != System.Net.HttpStatusCode.OK)
                    {
                        dynamic errorResponse = new T();

                        errorResponse.Error = JsonConvert.DeserializeObject<GalleryError>(
                           httpResponse.Content);

                        errorResponse.Error.StatusCode = httpResponse.StatusCode;

                        return errorResponse;
                    }

                    List<Newtonsoft.Json.Serialization.ErrorEventArgs> jsonErrors =
                        new List<Newtonsoft.Json.Serialization.ErrorEventArgs>();

                    T response = JsonConvert.DeserializeObject<T>(
                           httpResponse.Content,
                           new JsonSerializerSettings
                            {
                                Error = (object sender,
                                    Newtonsoft.Json.Serialization.ErrorEventArgs args) =>
                                {
                                    args.ErrorContext.Handled = true;

                                    jsonErrors.Add(args);
                                }
                            });

                    if (jsonErrors.Count != 0)
                    {
                        dynamic responseWithErrors =
                            (response != null ? response : new T());

                        responseWithErrors.Error =
                            new GalleryError(jsonErrors);

                        return responseWithErrors;
                    }

                    return response;
                }
                catch (Exception ex)
                {
                    dynamic errorResponse = new T();

                    errorResponse.Error = new GalleryError(ex);

                    return errorResponse;
                }
            });
        }
    }
}
