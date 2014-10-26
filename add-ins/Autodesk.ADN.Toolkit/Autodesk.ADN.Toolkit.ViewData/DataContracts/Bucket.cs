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

namespace Autodesk.ADN.Toolkit.ViewData.DataContracts
{
    /////////////////////////////////////////////////////////////////////////////////
    // Bucket creation 
    //
    /////////////////////////////////////////////////////////////////////////////////
    public enum BucketPolicyEnum
    {
        kTransient,
        kTemporary,
        kPersistent
    }

    public class BucketCreationData
    {
        public BucketCreationData(string name, BucketPolicyEnum policy)
        {
            Name = name.ToLower();
            Policy = policy;
            servicesAllowed = new List<ServicesAllowed>();
        }

        public string Name
        {
            get;
            private set;
        }

        public List<ServicesAllowed> servicesAllowed
        {
            get;
            private set;
        }

        public BucketPolicyEnum Policy
        {
            get;
            private set;
        }

        public string ToJsonString()
        {
            string result =
                "{\"bucketKey\":\"" + Name +
                "\",\"servicesAllowed\":{";

            foreach (var service in servicesAllowed)
            {

            }

            result += "},";

            switch (Policy)
            {
                case BucketPolicyEnum.kTransient:
                    result += "\"policy\":\"transient\"}";
                    break;

                case BucketPolicyEnum.kTemporary:
                    result += "\"policy\":\"temporary\"}";
                    break;

                case BucketPolicyEnum.kPersistent:
                    result += "\"policy\":\"persistent\"}";
                    break;

                default:
                    result += "\"policy\":\"transient\"}";
                    break;
            }

            return result;
        }
        }

    /////////////////////////////////////////////////////////////////////////////////
    // Bucket Details Response 
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class BucketDetailsResponse : ViewDataResponseBase
    {
        [JsonProperty(PropertyName = "key")]
        public string BucketKey
        {
            get;
            private set;
        }

        public string Owner
        {
            get;
            private set;
        }

        [DisplayName("Created Date")]
        public DateTime CreatedDate
        {
            get;
            private set;
        }

        public List<ServicesAllowed> Permissions
        {
            get;
            private set;
        }

        [DisplayName("Policy")]
        [JsonProperty(PropertyName = "policykey")]
        public string Policy
        {
            get;
            private set;
        }

        public BucketDetailsResponse()
        {
            Permissions = new List<ServicesAllowed>();
        }

        [JsonConstructor]
        public BucketDetailsResponse(
            string bucketKey,
            string owner,
            double createDate,
            List<ServicesAllowed> permissions,
            string policy)
        {
            BucketKey = bucketKey;
            Owner = owner;
            CreatedDate = FromUnixTime(createDate);
            Permissions = permissions;
            Policy = policy;
        }

        public BucketDetailsResponse(
            string bucketKey,
            string owner,
            DateTime createDate,
            List<ServicesAllowed> permissions,
            string policy)
        {
            BucketKey = bucketKey;
            Owner = owner;
            CreatedDate = createDate;
            Permissions = permissions;
            Policy = policy;
        }

        static DateTime FromUnixTime(double unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime * 0.001);
        }
    }
}
