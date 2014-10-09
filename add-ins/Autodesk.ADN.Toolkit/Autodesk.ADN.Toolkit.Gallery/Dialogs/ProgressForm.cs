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
        private bool bComplete = false;

        private static bool bAutoClose = true;

        public ProgressForm(
            string modelName,
            TranslationNotifier notifier)
        {
            InitializeComponent();

            cbClose.Checked = bAutoClose;

            lbModel.Text = modelName;

            notifier.OnTranslationStatusChanged += 
                OnTranslationStatusChanged;

            notifier.OnTranslationError += 
                OnTranslationError;

            notifier.OnTranslationCompleted += 
                OnTranslationCompleted;
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
        }

        private void cbClose_CheckedChanged(object sender, EventArgs e)
        {
            bAutoClose = cbClose.Checked;

            if(bComplete)
                Close();
        }
    }
}