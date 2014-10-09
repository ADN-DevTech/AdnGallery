using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Forms.Integration;

namespace Autodesk.ADN.Toolkit.Gallery.Dialogs
{
    public partial class FileUploadForm : Form
    {
        private static bool bShowProgress = false;

        public FileUploadForm()
        {
            InitializeComponent();

            cbProgress.Checked = bShowProgress;

            DialogResult = DialogResult.Cancel;         
        }

        public string UserName
        {
            get
            {
                return _tbUsername.Text;
            }
        }

        public string EMail
        {
            get
            {
                return _tbEmail.Text;
            }
        }

        public bool ShowProgress
        {
            get
            {
                return bShowProgress;
            }
        }

        private void bOK_Click(object sender, EventArgs e)
        {
            DialogResult = DialogResult.OK;

            Close();
        }

        private void bCancel_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void cbProgress_CheckedChanged(object sender, EventArgs e)
        {
            bShowProgress = cbProgress.Checked;
        }
    }
}
