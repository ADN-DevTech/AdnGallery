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
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Autodesk.ADN.Toolkit.ViewData.DataContracts
{
    /////////////////////////////////////////////////////////////////////////////////
    // Delegates
    //
    /////////////////////////////////////////////////////////////////////////////////
    public delegate void OnTranslationStatusChangedHandler(
        ViewableResponse response);

    public delegate void OnTranslationCompletedHandler(
        ViewableResponse response);

    public delegate void OnTranslationErrorHandler(
        ViewDataError error);

    /////////////////////////////////////////////////////////////////////////////////
    // Translation Notifier
    //
    /////////////////////////////////////////////////////////////////////////////////
    public class TranslationNotifier
    {
        private AdnViewDataClient _client;       
        private int _pollingPeriod;
        private Control _syncCtrl;
        private Thread _worker;
        private string _fileId;

        public TranslationNotifier(
            AdnViewDataClient client,
            string fileId,
            int pollingPeriod = 1000)
        {
            _worker = null;
            _client = client;
            _fileId = fileId;
            _pollingPeriod = pollingPeriod;

            _syncCtrl = new Control();
            _syncCtrl.CreateControl();
        }

        public void Activate()
        {
            if (_worker == null)
            {
                _worker = new Thread(new ThreadStart(this.DoWork));
                _worker.Start();
            }
        }

        private async void DoWork()
        {
            string lastProgress = "";

            ViewableResponse viewableResponse;

            while (true)
            {
                viewableResponse = await _client.GetViewableAsync(
                    _fileId, ViewableOptionEnum.kStatus);

                if (!viewableResponse.IsOk())
                {
                    if (OnTranslationError != null)
                    {
                        _syncCtrl.Invoke(OnTranslationError, new object[]
                        {                      
                            viewableResponse.Error
                        });
                    }

                    return;
                }

                if (OnTranslationStatusChanged != null)
                {
                    if (lastProgress != viewableResponse.Progress)
                    {
                        _syncCtrl.Invoke(OnTranslationStatusChanged, new object[]
                        {                      
                            viewableResponse
                        });
                    }
                }

                if (viewableResponse.Progress.ToLower() == "complete")
                {
                    if (OnTranslationCompleted != null)
                    {
                        _syncCtrl.Invoke(OnTranslationCompleted, new object[]
                        {                      
                            viewableResponse
                        });
                    }

                    return;
                }

                lastProgress = viewableResponse.Progress;

                Thread.Sleep(_pollingPeriod);
            }
        }

        public event OnTranslationStatusChangedHandler
            OnTranslationStatusChanged = null;

        public event OnTranslationCompletedHandler
            OnTranslationCompleted = null;

        public event OnTranslationErrorHandler
            OnTranslationError = null;
    }
}
