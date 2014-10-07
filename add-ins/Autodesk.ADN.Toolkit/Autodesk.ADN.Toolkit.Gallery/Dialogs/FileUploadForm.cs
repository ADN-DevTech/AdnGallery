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
        public FileUploadForm()
        {
            InitializeComponent();

            DialogResult = DialogResult.Cancel;
        }
    }
}
