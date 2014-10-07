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
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Autodesk.ADN.Toolkit.UI
{
    public delegate void OnDownloadProgressChangedHandler(
        DownloadProgressChangedEventArgs e);

    public delegate void OnDownloadFileCompletedHandler(
       Uri url,
       string location,
       AsyncCompletedEventArgs e,
       TimeSpan elapsed);

    public class AdnFileDownloader
    {       
        private WebClient _webClient;
        private Control _syncCtrl;
        private string _location;
        private Stopwatch _sw;
        private Uri _url;
        
        public AdnFileDownloader(Uri url, string location)
        {
            _sw = new Stopwatch();
            _url = url;
            _location = location;

            _syncCtrl = new Control();
            _syncCtrl.CreateControl();
        }

        public void Download()
        {
            using (_webClient = new WebClient())
            {
                _sw.Reset();
                _sw.Start();

                _webClient.DownloadFileCompleted +=
                    new AsyncCompletedEventHandler(
                        DownloadFileCompleted);

                _webClient.DownloadProgressChanged +=
                    new DownloadProgressChangedEventHandler(
                        ProgressChanged);

                _webClient.DownloadFileAsync(
                    _url,
                    _location);
            }
        }

        public async Task<bool> DownloadAsync()
        {
            using (_webClient = new WebClient())
            {
                return await Task<bool>.Factory.StartNew(() =>
                {
                    try
                    {
                        _sw.Reset();
                        _sw.Start();

                        _webClient.DownloadFile(
                            _url,
                            _location);

                        _sw.Stop();

                        if (OnDownloadFileCompleted != null)
                        {
                            _syncCtrl.Invoke(OnDownloadFileCompleted, new object[]
                            {                      
                                _url, _location, null, _sw.Elapsed
                            });
                        }

                        return true;
                    }
                    catch //(Exception e)
                    {
                        return false;
                    }
                    finally
                    {
                        _webClient = null; 
                    }
                });
            }
        }

        public void CancelDownloadAsnyc()
        { 
            if(_webClient != null)
            {
                 _webClient.CancelAsync();
            }
        }

        private void DownloadFileCompleted(
            object sender, 
            AsyncCompletedEventArgs e)
        {
            _webClient = null;

            _sw.Stop();

            if (OnDownloadFileCompleted != null)
            {
                _syncCtrl.Invoke(OnDownloadFileCompleted, new object[]
                {                      
                    _url, _location, e, _sw.Elapsed
                });
            }
        }

        private void ProgressChanged(
            object sender, 
            DownloadProgressChangedEventArgs e)
        {
            // Calculate download speed 
            //string.Format("{0} kb/s", 
            //  (e.BytesReceived / 1024d / _sw.Elapsed.TotalSeconds).ToString("0.00"));
                        
            //string.Format("{0} Mb / {1} Mb",
            //    (e.BytesReceived / 1024d / 1024d).ToString("0.00"),
            //    (e.TotalBytesToReceive / 1024d / 1024d).ToString("0.00")
            //);

            if (OnDownloadProgressChanged != null)
            {
                _syncCtrl.Invoke(OnDownloadProgressChanged, new object[]
                {                      
                    e
                });
            }
        }

        public event OnDownloadProgressChangedHandler
           OnDownloadProgressChanged = null;

        public event OnDownloadFileCompletedHandler
           OnDownloadFileCompleted = null;
    }
}
