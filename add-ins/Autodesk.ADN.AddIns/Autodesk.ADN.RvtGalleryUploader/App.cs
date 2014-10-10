#region Namespaces
using System;
using System.Reflection;
using Autodesk.Revit.UI;
#endregion // Namespaces

namespace Autodesk.ADN.RvtGalleryUploader
{
  class App : IExternalApplication
  {
    const string _cmd_classname 
      = "Autodesk.ADN.RvtGalleryUploader.CmdUpload";

    /// <summary>
    /// Add buttons for our command
    /// to the ribbon panel.
    /// </summary>
    void PopulatePanel( RibbonPanel p )
    {
      string path = Assembly.GetExecutingAssembly()
        .Location;

      RibbonItemData i1 = new PushButtonData(
          "RvtGalleryUploader_CmdUpload", 
          "RVT Gallery\r\nUploader",
          path, _cmd_classname );

      i1.ToolTip = "Upload RVT model to "
        + "Autodesk View and Data API";

      //p.AddStackedItems( i1, i2, i3 );

      p.AddItem( i1 );
    }

    public Result OnStartup( UIControlledApplication a )
    {
      PopulatePanel(
        a.CreateRibbonPanel(
          "RVT Gallery Uploader" ) );

      return Result.Succeeded;
    }

    public Result OnShutdown( UIControlledApplication a )
    {
      return Result.Succeeded;
    }
  }
}
