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
using Newtonsoft.Json;

namespace Autodesk.ADN.Toolkit.ViewData.DataContracts
{
    public enum ViewableOptionEnum
    { 
        kDefault,
        kStatus,
        kAll
    }

    public class RegisterResponse : ViewDataResponseBase
    {
        public string Result
        {
            get;
            set;
        }
    }

    public class ViewableResponse: ViewDataResponseBase
    {
        public string Guid
        {
            get;
            set;
        }

        public int Order
        {
            get;
            private set;
        }

        public string Version
        {
            get;
            private set;
        }

        public string Type
        {
            get;
            private set;
        }

        public string Name
        {
            get;
            private set;
        }

        public bool HasThumbnail
        {
            get;
            private set;
        }

        public string Mime
        {
            get;
            private set;
        }

        public string Progress
        {
            get;
            private set;
        }

        public string Status
        {
            get;
            private set;
        }

        public string Success
        {
            get;
            private set;
        }

        public string StartedAt
        {
            get;
            private set;
        }

        public string Role
        {
            get;
            private set;
        }

        public string URN
        {
            get;
            set;
        }

        [DisplayName("File Id")]
        public string FileId
        {
            get
            {
                return (URN != null ? 
                    URN.FromBase64() : "");
            }
        }

        public string Result
        {
            get;
            private set;
        }

        [Browsable(false)]
        public List<ViewableResponse> Children
        {
            get;
            private set;
        }

        public List <double> Camera
        {
            get;
            private set;
        }

        public List<double> Resolution
        {
            get;
            private set;
        }

        public List<ViewableMessage> Messages
        {
            get;
            private set;
        }

        public ViewableResponse()
        {
            Camera = new List<double>();
            Resolution = new List<double>();  
            Children = new List<ViewableResponse>();           
            Messages = new List <ViewableMessage>();
        }

        [JsonConstructor]
        public ViewableResponse(
            string guid,
            int order,
            string version,
            string type,
            string name,
            bool hasThumbnail,
            string mime,
            string progress,
            string status,
            string success,
            string startedAt,
            string role,
            string urn,
            string result,
            List<ViewableResponse> children,
            List <double> camera,
            List<double> resolution,
            List<ViewableMessage> messages)
            {
                Guid = guid;
                Order = order;
                Version = version;
                Type = type;
                Name = name;
                HasThumbnail = hasThumbnail;
                Mime = mime;
                Progress = progress;
                Status = status;
                Success = success;
                StartedAt = startedAt;
                Role = role;
                URN = urn;
                Result = result;
                Children = children;
                Camera = camera;
                Resolution = resolution;
                Messages = messages;
            }
    }

    public class ViewableMessage
    {
        public string Type
        {
            get;
            private set;
        }

        public string Code
        {
            get;
            private set;
        }

        public string Message
        {
            get;
            private set;
        }

        public ViewableMessage()
        { 
        
        }

        [JsonConstructor]
        public ViewableMessage(
            string type,
            string code,
            string message)
        {
            Type = type;
            Code = code;
            Message = message;
        }
    }
}