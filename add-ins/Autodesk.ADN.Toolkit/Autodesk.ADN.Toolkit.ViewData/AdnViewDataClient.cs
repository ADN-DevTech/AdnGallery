/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved 
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted, 
// provided that the above copyright notice appears in all copies and 
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting 
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS. 
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC. 
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Autodesk.ADN.Toolkit.ViewData.DataContracts;
using Newtonsoft.Json;
using RestSharp;
using RestSharp.Contrib;

namespace Autodesk.ADN.Toolkit.ViewData
{
    /////////////////////////////////////////////////////////////////////////////////////
    // ADN View & Data Client
    //
    /////////////////////////////////////////////////////////////////////////////////////
    public class AdnViewDataClient
    {
        private RestClient _restClient;

        private string _clientKey;

        private string _secretKey;

        /////////////////////////////////////////////////////////////////////////////////
        // Constructor
        //
        /////////////////////////////////////////////////////////////////////////////////
        public AdnViewDataClient(
            string serviceUrl,
            string clientKey,
            string secretKey,
            bool autoRefresh = true)
        { 
            _clientKey = clientKey;

            _secretKey = secretKey;

            AutoRefresh = autoRefresh;

            TokenResponse = new TokenResponse();

            _restClient = new RestClient(serviceUrl);     
        }

        /////////////////////////////////////////////////////////////////////////////////
        // 
        //
        /////////////////////////////////////////////////////////////////////////////////
        public bool AutoRefresh
        {
            get;
            set;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // 
        //
        /////////////////////////////////////////////////////////////////////////////////
        public TokenResponse TokenResponse
        {
            get;
            private set;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // POST /authentication/{apiversion}/authenticate
        //
        /////////////////////////////////////////////////////////////////////////////////
        private Task<TokenResponse> GetAccessTokenAsync()
        {
            var request = new RestRequest(
                "authentication/v1/authenticate", 
                Method.POST);

            request.AddParameter("client_id", _clientKey);
            request.AddParameter("client_secret", _secretKey);
            request.AddParameter("grant_type", "client_credentials");

            return _restClient.ExecuteAsync
                <TokenResponse>(
                    request);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Performs authentication
        //
        /////////////////////////////////////////////////////////////////////////////////
        public async Task<TokenResponse> AuthenticateAsync()
        {
            var tokenResponse = await GetAccessTokenAsync();

            if (!tokenResponse.IsOk())
            {
                return tokenResponse;
            }

            new Thread(() =>
            {
                Thread.CurrentThread.IsBackground = true;

                Thread.Sleep(TimeSpan.FromSeconds(
                    tokenResponse.ExpirationTime));

                if (AutoRefresh)
                {
                    AuthenticateAsync().Wait();
                }
                
            }).Start();

            TokenResponse = tokenResponse;

            return tokenResponse;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // POST /oss/{apiversion}/buckets
        //
        /////////////////////////////////////////////////////////////////////////////////
        public Task<BucketDetailsResponse> CreateBucketAsync(
            BucketCreationData bucketData)
        {
            var request = new RestRequest(
                "oss/v1/buckets",
                Method.POST);

            request.AddHeader("Authorization", "Bearer " + TokenResponse.AccessToken);
            request.AddHeader("Content-Type", "application/json");

            request.AddParameter("application/json", 
                bucketData.ToJsonString(), 
                ParameterType.RequestBody);

            return _restClient.ExecuteAsync
                <BucketDetailsResponse>(
                    request);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // GET /oss/{apiversion}/buckets/{bucketkey}/details
        //
        /////////////////////////////////////////////////////////////////////////////////
        public Task<BucketDetailsResponse> GetBucketDetailsAsync(
           string bucketKey)
        {
            var request = new RestRequest(
                "oss/v1/buckets/" + bucketKey.ToLower() + "/details", 
                Method.GET);

            request.AddHeader("Authorization", "Bearer " + TokenResponse.AccessToken);
            request.AddHeader("Content-Type", "application/json");

            return _restClient.ExecuteAsync
                <BucketDetailsResponse>(
                    request);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // GET /oss/{apiversion}/buckets/{bucketkey}/objects/{objectKey}/details
        //
        /////////////////////////////////////////////////////////////////////////////////
        public async Task<ObjectDetailsResponse> GetObjectDetailsAsync(
           string bucketKey,
           string objectKey)
        {
            var request = new RestRequest(
                "oss/v1/buckets/" + bucketKey + "/objects/" + objectKey + "/details", 
                Method.GET);

            request.AddHeader("Authorization", "Bearer " + TokenResponse.AccessToken);
            request.AddHeader("Content-Type", "application/json");

            var result = await _restClient.ExecuteAsync
                <ObjectDetailsResponse>(
                    request);

            if (result.IsOk())
            {
                foreach (var obj in result.Objects)
                {
                    result.Objects[0].SetFileId(GetFileId(bucketKey, obj.ObjectKey));
                }
            }

            return result;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // PUT /oss/{apiversion}/buckets/{bucketkey}/objects/{objectkey}
        //
        /////////////////////////////////////////////////////////////////////////////////
        public Task<ObjectDetailsResponse> UploadFileAsync(
            string bucketKey, 
            FileUploadInfo fi)
        {
            string objectKey = HttpUtility.UrlEncode(fi.Key);

            using (BinaryReader binaryReader = new BinaryReader(fi.InputStream))
            {
                byte[] fileData = binaryReader.ReadBytes((int)fi.Length);

                RestRequest request = new RestRequest(
                    "oss/v1/buckets/" + bucketKey.ToLower() +
                    "/objects/" + objectKey,    
                    Method.PUT);

                request.AddHeader("Authorization", "Bearer " + TokenResponse.AccessToken);

                request.AddParameter("Content-Type", "application/stream");
                request.AddParameter("Content-Length", fi.Length);
                request.AddParameter("requestBody", fileData, ParameterType.RequestBody);
                request.Timeout = 1000 * 60 * 60; //1 hour timeout 

                return _restClient.ExecuteAsync
                    <ObjectDetailsResponse>(
                        request);
            }
        }

        /////////////////////////////////////////////////////////////////////////////////
        // POST /viewingservice/{apiversion}/register
        //
        /////////////////////////////////////////////////////////////////////////////////
        public Task<RegisterResponse> RegisterAsync(string fileId)
        {
            RestRequest request = new RestRequest(
                "viewingservice/v1/register",
                 Method.POST);

            request.AddHeader(
                "Authorization", 
                "Bearer " + TokenResponse.AccessToken);

            request.AddHeader(
                "Content-Type", 
                "application/json");

            string body = "{\"urn\":\"" + fileId.ToBase64() + "\"}";

            request.AddParameter(
                "application/json", 
                body, 
                ParameterType.RequestBody);

            return _restClient.ExecuteAsync
                   <RegisterResponse>(
                       request);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // GET /viewingservice/{apiversion}/thumbnails/{urn}?
        //     guid=$GUID$ & width=$WIDTH$ & height=$HEIGHT$ (& type=$TYPE$)
        //
        /////////////////////////////////////////////////////////////////////////////////
        public async Task<ThumbnailResponse> GetThumbnailAsync(
            string fileId,
            int width = 150,
            int height = 150,
            string guid = "")
        {
            var response = new ThumbnailResponse();

            try
            {
                RestRequest request = new RestRequest(
                    "viewingservice/v1/thumbnails/" + fileId.ToBase64(),
                     Method.GET);

                request.AddHeader(
                    "Authorization", 
                    "Bearer " + TokenResponse.AccessToken);

                request.AddParameter("width", width);
                request.AddParameter("height", height);

                if (guid != "")
                {
                    request.AddParameter("guid", guid);
                }

                var httpResponse = await _restClient.ExecuteAsync(
                    request);

                if (httpResponse.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    if (httpResponse.Content != string.Empty)
                    {
                        response.Error = JsonConvert.DeserializeObject<ViewDataError>(
                           httpResponse.Content);

                        response.Error.StatusCode = httpResponse.StatusCode;
                    }
                    else
                    {
                        response.Error = new ViewDataError(
                            httpResponse.StatusCode);
                    }
                }
                else
                {
                    using (MemoryStream ms = 
                        new MemoryStream(httpResponse.RawBytes))
                    {
                        response.Image = Image.FromStream(ms);
                    }
                }
            }
            catch (Exception ex)
            {
                response.Error = new ViewDataError(ex);
            }

            return response;
        }
    
        /////////////////////////////////////////////////////////////////////////////////
        // GET /viewingservice/{apiversion}/{urn}?guid=$GUID$
        // GET /viewingservice/{apiversion}/{urn}/status?guid=$GUID$
        // GET /viewingservice/{apiversion}/{urn}/all?guid=$GUID$
        //
        /////////////////////////////////////////////////////////////////////////////////
        public Task<ViewableResponse> GetViewableAsync(
            string fileId,
            ViewableOptionEnum option = ViewableOptionEnum.kDefault,
            string guid = "")
        {
            string optionStr = "";

            switch (option)
            { 
                case ViewableOptionEnum.kStatus:
                    optionStr = "/status";
                    break;

                case ViewableOptionEnum.kAll:
                    optionStr = "/all";
                    break;

                default:
                    break;
            }

            RestRequest request = new RestRequest(
               "viewingservice/v1/" + fileId.ToBase64() + optionStr,
                Method.GET);

            request.AddHeader("Authorization", "Bearer " + TokenResponse.AccessToken);

            if (guid != "")
            {
                request.AddParameter("guid", guid);
            }

            return _restClient.ExecuteAsync
                   <ViewableResponse>(
                       request);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // GET /viewingservice/{apiversion}/supported
        //
        /////////////////////////////////////////////////////////////////////////////////
        public Task<FormatResponse> GetSupportedFormats()
        {
            RestRequest request = new RestRequest(
               "viewingservice/v1/supported",
                Method.GET);

            request.AddHeader("Authorization", "Bearer " + TokenResponse.AccessToken);
            request.AddHeader("Content-Type", "application/json");

            return _restClient.ExecuteAsync
                   <FormatResponse>(
                       request);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Returns file id for bucket and object
        //
        /////////////////////////////////////////////////////////////////////////////////
        public string GetFileId(string bucketKey, string objectKey)
        {
            return "urn:adsk.objects:os.object:" + bucketKey.ToLower() + "/" + objectKey;
        }

        /////////////////////////////////////////////////////////////////////////////////
        //Performs full workflow: bucket creation, file upload, registration, progress
        //
        /////////////////////////////////////////////////////////////////////////////////
        async public Task<ViewDataResponseBase> UploadAndRegisterAsync(
            BucketCreationData bucketData, 
            FileUploadInfo fi, 
            bool waitForTranslation = false,
            bool createBucketIfNotExist = true)
        {
            var bucketDetailsResponse = await GetBucketDetailsAsync(
                bucketData.Name);

            if (!bucketDetailsResponse.IsOk())
            {
                // Attempts creation if createBucketIfNotExist = true

                if (bucketDetailsResponse.Error.StatusCode ==
                    System.Net.HttpStatusCode.NotFound && createBucketIfNotExist)
                {
                    var bucketCreationResponse = await CreateBucketAsync(bucketData);
            
                    if(!bucketDetailsResponse.IsOk())
                    {
                        return bucketCreationResponse;
                    }
                }
                else
                {
                    return bucketDetailsResponse;
                }
            }

            var objectDetailsResponse = await UploadFileAsync(
                bucketData.Name, fi);

            if (!objectDetailsResponse.IsOk() || objectDetailsResponse.Objects.Count < 1)
            {
                return objectDetailsResponse;
            }

            string fileId = objectDetailsResponse.Objects[0].FileId;

            var registerResponse = await RegisterAsync(fileId);

            if (!registerResponse.IsOk() ||!waitForTranslation)
            {
                return registerResponse;
            }

            while (true)
            {
                await Task.Delay(2000);

                var viewableResponse = await GetViewableAsync(
                    fileId,
                    ViewableOptionEnum.kStatus);

                if (!viewableResponse.IsOk())
                {
                    return viewableResponse;
                }

                else if (viewableResponse.Progress.ToLower() == "complete")
                    return viewableResponse;       
            }
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

                        errorResponse.Error = JsonConvert.DeserializeObject<ViewDataError>(
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
                            new ViewDataError(jsonErrors);

                        return responseWithErrors;
                    }

                    return response;
                }
                catch (Exception ex)
                {
                    dynamic errorResponse = new T();

                    errorResponse.Error = new ViewDataError(ex);

                    return errorResponse;
                }
            });
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Custom Extensions for string
    //
    /////////////////////////////////////////////////////////////////////////////////
    public static class stringExtensions
    {
        public static string ToBase64(this string str)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(str);

            return Convert.ToBase64String(bytes);
        }

        public static string FromBase64(this string str)
        {
            try
            {
                byte[] bytes = Convert.FromBase64String(str);

                return Encoding.UTF8.GetString(bytes);
            }
            catch
            {
                return "Invalid base64 string: " + str;
            }
        }
    }
}
