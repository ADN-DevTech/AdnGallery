#region Namespaces
using System;
using System.Collections.Generic;
using System.Diagnostics;
using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using Autodesk.ADN.Toolkit.ViewData.DataContracts;
using System.Threading;
using Autodesk.ADN.Toolkit.Gallery.Dialogs;
using System.IO;
using Autodesk.ADN.Toolkit.ViewData;
using Autodesk.ADN.Toolkit.Gallery;
#endregion // Namespaces

namespace Autodesk.ADN.RvtGalleryUploader
{
  [Transaction( TransactionMode.ReadOnly )]
  public class CmdUpload : IExternalCommand
  {
    static void OnTranslationCompleted(
        ViewableResponse response )
    {
      System.Windows.Forms.MessageBox.Show( 
        "Translation complete.", 
        "RVT Gallery Uploader" );
    }

    async static public void UploadToGallery(
      string filename,
      string modelname )
    {
      System.Windows.Forms.IWin32Window revit_window
        = new JtWindowHandle(
          Autodesk.Windows.ComponentManager.ApplicationWindow );

      var syncContext = SynchronizationContext.Current;

      FileUploadForm fUp = new FileUploadForm();

      fUp.UserName = Util.GetUser();
      fUp.EMail = Util.GetEmail();

      var dialogResult = fUp.ShowDialog( revit_window );

      if( dialogResult != System.Windows.Forms.DialogResult.OK )
      {
        Util.LogError( "Upload cancelled." );

        return;
      }

      if( fUp.StoreDetails )
      {
        Util.StoreUserInfo( fUp.UserName, fUp.EMail );
      }

      SynchronizationContext.SetSynchronizationContext(
        syncContext );

      // The gallery bucket

      var bucketKey = "adn-viewer-gallery";

      string consumer_key, consumer_secret;

      if( !Util.GetConsumerCredentials( 
        "C:/credentials.txt", 
        out consumer_key, 
        out consumer_secret ) )
      {
        Util.LogError( "Consumer credentials retrieval failed." );
        return;
      }

      AdnViewDataClient viewDataClient = new AdnViewDataClient(
        UserSettings.BASE_URL,
        consumer_key,
        consumer_secret );

      var tokenResult = await viewDataClient.AuthenticateAsync();

      if( !tokenResult.IsOk() )
      {
        Util.LogError( "Authentication failed: "
          + tokenResult.Error.Reason );

        return;
      }

      // Generate unique file key

      string objectKey = Guid.NewGuid().ToString()
        + ".rvt";

      var fi = FileUploadInfo.CreateFromFile(
        objectKey, filename );

      var bucketData = new BucketCreationData(
        bucketKey,
        BucketPolicyEnum.kPersistent );

      var response
        = await viewDataClient.UploadAndRegisterAsync(
          bucketData, fi );

      if( !response.IsOk() )
      {
        Util.LogError( "Error: " + response.Error.Reason );

        return;
      }

      if( response is RegisterResponse )
      {
        RegisterResponse registerResponse = response as RegisterResponse;

        if( registerResponse.Result.ToLower() != "success" )
        {
          Util.LogError( "Registration failed: " + registerResponse.Result );

          return;
        }

        var fileId = viewDataClient.GetFileId(
          bucketKey,
          objectKey );

        var dbModel = new DBModel(
          new Author( fUp.UserName, fUp.EMail ),
          modelname,
          fileId,
          fileId.ToBase64() );

        string url = Util.GalleryUrl;

        AdnGalleryClient galleryClient = new AdnGalleryClient( 
          url );

        DBModelResponse modelResponse 
          = await Util.AddModelToGalleryAsync( 
            dbModel );

        if( !modelResponse.IsOk() )
        {
          Util.LogError( string.Format( "Error: '{0}' {1}",
            modelResponse.Error.ToString(),
            null == modelResponse.Model ? "model is null" : "" ) );

          return;
        }

        url = url + "/#/viewer?id=" + modelResponse.Model.Id;

        if( fUp.ShowProgress )
        {
          var notifier = new TranslationNotifier(
            viewDataClient,
            fileId,
            2000 );

          var fProgress = new ProgressForm(
            modelname,
            url,
            notifier );

          fProgress.Show( revit_window );

          notifier.OnTranslationCompleted +=
            OnTranslationCompleted;

          notifier.Activate();
        }
        string msg = "You successfully "
          + " uploaded a new model to the gallery.\r\n"
          + "Your model is viewable at the following url:\r\n"
          + url;

        Util.LogError( msg );

        TaskDialog dlg = new TaskDialog( 
          "Gallery Upload" );

        dlg.MainInstruction = "Upload succeeded";
        dlg.MainContent = msg;
        dlg.Show();
      }
    }

    public Result Execute(
      ExternalCommandData commandData,
      ref string message,
      ElementSet elements )
    {
      UIApplication uiapp = commandData.Application;
      UIDocument uidoc = uiapp.ActiveUIDocument;
      Document doc = uidoc.Document;

      if( doc.IsModified )
      {
        message = "Sorry, this model has been modified. "
         + "Please resave before uploading.";
        Util.LogError( message );
        return Result.Failed;
      }

      if( doc.IsDetached )
      {
        message = "Sorry, this model is detached and "
          + "I cannot access the RVT file path.";
        Util.LogError( message );
        return Result.Failed;
      }

      if( string.IsNullOrEmpty( doc.PathName ) )
      {
        message = "Please save the model to a file "
          + "before running this command, so I can "
          + "upload it.";
        Util.LogError( message );
        return Result.Failed;
      }

      // Generate temporary filename for uploading
      // because otherwise Revit will not allow access 

      //string filename = Path.GetTempFileName() + ".rvt";
      //string filename = "C:/tmp/RvtGalleryUploader.tmp.rvt";
      string filename = Path.GetTempPath() + "RvtGalleryUploader.tmp.rvt";

      filename = filename.Replace( '\\', '/' ); // easier to read in debugger

      Debug.Print( "Copy '{0}' to '{1}' for upload", 
        doc.PathName, filename );

      File.Copy( doc.PathName, filename, true );

      Debug.Assert( File.Exists( filename ),
        "expected RVT file copy" );

      UploadToGallery( filename, doc.Title );

      //System.IO.File.Delete( filename );

      return Result.Succeeded;
    }
  }
}
