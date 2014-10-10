using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Autodesk.ADN.Toolkit.ViewData.DataContracts;

namespace Autodesk.ADN.Toolkit.Gallery.Dialogs
{
    public partial class ProgressForm : Form
    {
        private string url;

        private bool bComplete = false;

        private static bool bAutoClose = false;

        public ProgressForm(
            string modelName,
            string linkUrl,
            TranslationNotifier notifier)
        {
            InitializeComponent();

            url = linkUrl;

            cbClose.Checked = bAutoClose;

            lbModel.Text = modelName;

            notifier.OnTranslationStatusChanged += 
                OnTranslationStatusChanged;

            notifier.OnTranslationError += 
                OnTranslationError;

            notifier.OnTranslationCompleted += 
                OnTranslationCompleted;

            linkModel.LinkClicked += LinkClicked;
        }

        void OnTranslationError(ViewDataError error)
        {
 	        this.Text = "Translation Progress - Error";
        }

        void OnTranslationStatusChanged(ViewableResponse response)
        {
 	        this.Text = "Translation Progress - " + response.Progress;

            lbProgress.Text = response.Progress;

            progressBar.Value = ProgressToInt(response.Progress);
        }

        int ProgressToInt(string progress)
        {
            if (progress.ToLower() == "complete")
                return 100;

            var res = progress.Split(new char[] { '%' });

            if (res.Length == 1)
            {
                return 0;
            }

            return int.Parse(res[0]);
        }

        void OnTranslationCompleted(ViewableResponse response)
        {
            bComplete = true;

            if (bAutoClose)
                Close();

            linkModel.Enabled = true;
        }

        private void cbClose_CheckedChanged(object sender, EventArgs e)
        {
            bAutoClose = cbClose.Checked;

            if(bComplete)
                Close();
        }

        private void LinkClicked(
            object sender, 
            LinkLabelLinkClickedEventArgs e)
        {
            System.Diagnostics.ProcessStartInfo sInfo =
                new System.Diagnostics.ProcessStartInfo(url);

            System.Diagnostics.Process.Start(sInfo);
        }
    }
}