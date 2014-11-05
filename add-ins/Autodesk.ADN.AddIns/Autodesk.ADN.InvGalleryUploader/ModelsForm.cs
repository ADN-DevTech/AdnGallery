using Autodesk.ADN.Toolkit.Gallery;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Autodesk.ADN.InvGalleryUploader
{
  public partial class ModelsForm : Form
  {
    public ModelsForm(DBModelListResponse response)
    {
      InitializeComponent();

      foreach (var model in response.Models)
      {
        lbxModels.Items.Add(model.Name + " { urn: " + model.Urn + " }");
        //ed.WriteMessage("\n - " + model.Name + " { urn: " + model.Urn + " }");
      }
    }
  }
}
