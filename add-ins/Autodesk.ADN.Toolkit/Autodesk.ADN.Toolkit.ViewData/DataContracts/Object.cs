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
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Autodesk.ADN.Toolkit.ViewData.DataContracts
{
    /////////////////////////////////////////////////////////////////////////////////
    // Object Details Response 
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class ObjectDetailsResponse : ViewDataResponseBase
    {
        [DisplayName("Bucket Key")]
        [JsonProperty(PropertyName = "bucket-key")]
        public string BucketKey
        {
            get;
            set;
        }

        [DisplayName("Objects")]
        public List<ObjectDetails> Objects
        {
            get;
            set;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Thumbnail Response 
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class ThumbnailResponse : ViewDataResponseBase
    {
        public System.Drawing.Image Image
        {
            get;
            set;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // ServicesAllowed
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class ServicesAllowed
    {
        public string ServiceId
        {
            get;
            set;
        }

        public string Access
        {
            get;
            set;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // File Upload Info
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class FileUploadInfo
    {
        private FileUploadInfo()
        {

        }

        public string Key
        {
            get;
            set;
        }

        public Stream InputStream
        {
            get;
            set;
        }

        public long Length
        {
            get;
            set;
        }

        public static FileUploadInfo CreateFromStream(string key, Stream stream)
        {
            var result = new FileUploadInfo();

            result.Key = key;

            result.Length = stream.Length;

            result.InputStream = stream;

            return result;
        }

        public static FileUploadInfo CreateFromFile(string key, string filename)
        {
            try
            {
                var result = new FileUploadInfo();

                result.Key = key;

                FileStream fstream = File.Open(filename, FileMode.Open);

                result.Length = fstream.Length;

                result.InputStream = fstream;

                return result;
            }
            catch
            {
                return null;
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // ObjectDetails
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class ObjectDetails
    {
        [DisplayName("Location")]
        public Uri Location
        {
            get;
            private set;
        }

        [DisplayName("Size")]
        public int Size
        {
            get;
            private set;
        }

        [DisplayName("Object Key")]
        [JsonProperty(PropertyName = "key")]
        public string ObjectKey
        {
            get;
            private set;
        }

        [DisplayName("Bucket Key")]
        public string BucketKey
        {
            get
            {
                return FileId.Replace(
                "urn:adsk.objects:os.object:", "").
                Split(new char[] { '/' })[0];
            }
        }

        [DisplayName("File Id")]
        [JsonProperty(PropertyName = "id")]
        public string FileId
        {
            get;
            private set;
        }

        [DisplayName("URN")]
        public string URN
        {
            get
            {
                byte[] bytes = Encoding.UTF8.GetBytes(FileId);

                return Convert.ToBase64String(bytes);
            }
            set
            { 
            
            }
        }

        [DisplayName("Hash")]
        [JsonProperty(PropertyName = "sha-1")]
        public string Hash
        {
            get;
            private set;
        }

        [DisplayName("Content Type")]
        [JsonProperty(PropertyName = "content-type")]
        public Uri ContentType
        {
            get;
            private set;
        }

        public void SetFileId(string fileId)
        {
            FileId = fileId;
        }

        [JsonConstructor]
        public ObjectDetails(
            Uri location,
            int size,
            string objectKey,
            string fileId,
            string hash,
            Uri contentType)
        { 
            Location = location;
            Size = size;
            ObjectKey = objectKey;
            FileId = fileId;
            Hash = hash;
            ContentType = contentType;
        }
    }
}
