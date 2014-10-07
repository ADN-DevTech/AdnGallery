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
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Autodesk.ADN.Toolkit.ViewData.DataContracts
{
    /////////////////////////////////////////////////////////////////////////////////
    // Supported Formats
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class FormatResponse : ViewDataResponseBase
    {
        [JsonProperty(PropertyName = "extensions")]
        public List<string> Extensions
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "channelMapping")]
        public JObject ChannelMapping
        {
            get;
            private set;
        }

        [JsonProperty(PropertyName = "regExp")]
        public JObject RegularExpressions
        {
            get;
            private set;
        }
    }
}
