using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Autodesk.ADN.Toolkit.Gallery
{
    public class View
    {

    }

    public class Author
    {
        [JsonProperty(PropertyName = "name")]
        public string Name
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "email")]
        public string Email
        {
            get;
            private set;
        }

        [JsonConstructor]
        public Author(
            string name,
            string email)
        {
            Name = name;
            Email = email;
        }
    }

    public class DBModel
    {
        [JsonProperty(PropertyName = "author")]
        public Author Author
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "_id")]
        public string Id
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "name")]
        public string Name
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "fileId")]
        public string FileId
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "urn")]
        public string Urn
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "views")]
        public List<View> Views
        {
            get;
            private set;
        }

        [JsonConstructor]
        public DBModel(
            string id,
            Author author,
            string name,
            string fileId,
            string urn,
            List<View> views)
        {
            Id = id;
            Author = author;
            Name = name;
            FileId = fileId;
            Urn = urn;
            Views = views;
        }

        public DBModel(
            Author author,
            string name,
            string fileId,
            string urn)
        {
            Author = author;
            Name = name;
            FileId = fileId;
            Urn = urn;
            Views = new List<View>();
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Base Service Response 
    //
    /////////////////////////////////////////////////////////////////////////////////
    public abstract class ViewDataResponseBase
    {
        [Browsable(false)]
        public GalleryError Error
        {
            get;
            set;
        }

        public bool IsOk()
        {
            return (Error == null);
        }
    }

    public class DBModelResponse : ViewDataResponseBase
    {
        [JsonProperty(PropertyName = "model")]
        public DBModel Model
        {
            get;
            private set;
        }

        public DBModelResponse()
        {

        }

        [JsonConstructor]
        public DBModelResponse(
            DBModel model)
        {
            Model = model;
        }
    }

    public class DBModelListResponse : ViewDataResponseBase
    {
        [JsonProperty(PropertyName = "models")]
        public List <DBModel> Models
        {
            get;
            private set;
        }

        public DBModelListResponse()
        {

        }

        [JsonConstructor]
        public DBModelListResponse(
            List<DBModel> models)
        {
            Models = models;
        }
    }

    public class GalleryError
    {
        public HttpStatusCode StatusCode
        {
            get;
            set;
        }

        public List<ErrorEventArgs> JsonErrors
        {
            get;
            set;
        }

        public Exception Exception
        {
            get;
            set;
        }

        public GalleryError()
        { 
        
        }

        public GalleryError(Exception ex)
        {
            Exception = ex;
        }

        public GalleryError(HttpStatusCode statusCode)
        {
            StatusCode = statusCode;
        }

        public GalleryError(List<ErrorEventArgs> jsonErrors)
        {
            JsonErrors = jsonErrors;
        }
    }
}
