using System;
using System.Runtime.InteropServices;
using Inventor;
using Microsoft.Win32;
using System.Configuration;
using Autodesk.ADN.Toolkit.Gallery;
using System.IO;
using Autodesk.ADN.Toolkit.ViewData.DataContracts;
using Autodesk.ADN.Toolkit.Gallery.Dialogs;
using System.Threading;
using WinForms = System.Windows.Forms;
using MsgBox = System.Windows.Forms.MessageBox;
using Autodesk.ADN.Toolkit.ViewData;

namespace Autodesk.ADN.InvGalleryUploader
{
  /// <summary>
  /// This is the primary AddIn Server class that implements the ApplicationAddInServer interface
  /// that all Inventor AddIns are required to implement. The communication between Inventor and
  /// the AddIn is via the methods on this interface.
  /// </summary>
  [GuidAttribute("10050201-2ea3-497d-bab2-a9117154bc97")]
  public class StandardAddInServer : Inventor.ApplicationAddInServer
  {
    // Inventor application object.
    public static Inventor.Application m_inventorApplication;
    ButtonDefinition uploadButton, listButton;

    public StandardAddInServer()
    {
    }

    #region ApplicationAddInServer Members

    public void Activate(Inventor.ApplicationAddInSite addInSiteObject, bool firstTime)
    {
      // This method is called by Inventor when it loads the addin.
      // The AddInSiteObject provides access to the Inventor Application object.
      // The FirstTime flag indicates if the addin is loaded for the first time.

      // Initialize AddIn members.
      m_inventorApplication = addInSiteObject.Application;

      // TODO: Add ApplicationAddInServer.Activate implementation.
      // e.g. event initialization, command creation etc.
      CommandManager cm = m_inventorApplication.CommandManager;

      try
      {
        uploadButton = (ButtonDefinition)cm.ControlDefinitions["Autodesk.ADN.InvGalleryUploader.Upload"];
      }
      catch
      {
        uploadButton = cm.ControlDefinitions.AddButtonDefinition(
          "Gallery Upload", "Autodesk.ADN.InvGalleryUploader.Upload", CommandTypesEnum.kNonShapeEditCmdType);
      }
      uploadButton.OnExecute += uploadButton_OnExecute;
      uploadButton.AutoAddToGUI();

      try
      {
        listButton = (ButtonDefinition)cm.ControlDefinitions["Autodesk.ADN.InvGalleryUploader.List"];
      }
      catch
      {
        listButton = cm.ControlDefinitions.AddButtonDefinition(
          "Gallery List", "Autodesk.ADN.InvGalleryUploader.List", CommandTypesEnum.kNonShapeEditCmdType);
      }
      listButton.OnExecute += listButton_OnExecute;
      listButton.AutoAddToGUI();
    }

    async void listButton_OnExecute(NameValueMap Context)
    {
      AdnGalleryClient galleryClient = new AdnGalleryClient(
          Util.GetGalleryUrl());

      var modelListResponse = await galleryClient.GetModelsAsync();

      if (!modelListResponse.IsOk())
      {
        Util.LogError("Error: " + modelListResponse.Error.ToString());
        return;
      }

      ModelsForm mf = new ModelsForm(modelListResponse);
      mf.ShowDialog(new MyWin32());
    }

    public class MyWin32 : WinForms.IWin32Window
    {
      IntPtr hwnd;

      public MyWin32()
      {
        this.hwnd = new IntPtr(m_inventorApplication.MainFrameHWND);
      }

      public IntPtr Handle
      {
        get { return hwnd; }
      }
    }

    async void uploadButton_OnExecute(NameValueMap Context)
    {
      // Make sure it's a part file
      Document doc = m_inventorApplication.ActiveDocument;
      if (!(doc is PartDocument))
      {
        Util.LogError("Only works with part documents, aborting...");
        return;
      }

      // validates if file has name (ie saved at least once)
      FileInfo info = new FileInfo(doc.FullFileName);
      if (!info.Exists)
      {
        Util.LogError("Please save the document before uploading to the gallery, aborting...");
        return;
      }

      var syncContext = SynchronizationContext.Current;

      FileUploadForm fUp = new FileUploadForm();

      fUp.UserName = Util.GetUser();
      fUp.EMail = Util.GetEmail();

      var dialogResult = fUp.ShowDialog(new MyWin32());

      if (dialogResult != System.Windows.Forms.DialogResult.OK)
        return;

      if (fUp.StoreDetails)
      {
        Util.StoreUserInfo(fUp.UserName, fUp.EMail);
      }

      SynchronizationContext.SetSynchronizationContext(
          syncContext);

      // the gallery bucket
      var bucketKey = "adn-viewer-gallery";

      // Generates unique file key
      string objectKey = Guid.NewGuid().ToString() + ".ipt";

      // Generate temp filename
      string filename = System.IO.Path.GetTempFileName() + ".ipt";

      doc.SaveAs(filename, true);

      AdnViewDataClient viewDataClient = new AdnViewDataClient(
          UserSettings.BASE_URL,
          UserSettings.CONSUMER_KEY,
          UserSettings.CONSUMER_SECRET);

      var tokenResult = await viewDataClient.AuthenticateAsync();

      if (!tokenResult.IsOk())
      {
        Util.LogError("Authentication failed: " + tokenResult.Error.Reason);

        System.IO.File.Delete(filename);
        return;
      }

      var fi = FileUploadInfo.CreateFromFile(objectKey, filename);

      var bucketData = new BucketCreationData(
          bucketKey,
          BucketPolicyEnum.kPersistent);

      var response = await viewDataClient.UploadAndRegisterAsync(
          bucketData, fi);

      if (!response.IsOk())
      {
        Util.LogError("Error: " + response.Error.Reason);

        System.IO.File.Delete(filename);
        return;
      }

      if (response is RegisterResponse)
      {
        RegisterResponse registerResponse = response as RegisterResponse;

        if (registerResponse.Result.ToLower() != "success")
        {
          Util.LogError("Registration failed: " + registerResponse.Result);

          System.IO.File.Delete(filename);
          return;
        }

        var modelName = info.Name.Substring(0, info.Name.Length - 4);

        var fileId = viewDataClient.GetFileId(
            bucketKey,
            objectKey);

        var dbModel = new DBModel(
            new Author(fUp.UserName, fUp.EMail),
            modelName,
            fileId,
            fileId.ToBase64());

        AdnGalleryClient galleryClient = new AdnGalleryClient(
            Util.GetGalleryUrl());

        var modelResponse = await galleryClient.AddModelAsync(
            dbModel);

        if (!modelResponse.IsOk())
        {
          Util.LogError("Error: " + modelResponse.Error.ToString());

          System.IO.File.Delete(filename);
          return;
        }

        var url = Util.GetGalleryUrl() + "/#/viewer?id=" +
            modelResponse.Model.Id;

        if (fUp.ShowProgress)
        {
          var notifier = new TranslationNotifier(
              viewDataClient,
              fileId,
              2000);

          var fProgress = new ProgressForm(
              modelName,
              url,
              notifier);

          fProgress.Show(new MyWin32());

          //notifier.OnTranslationCompleted +=
          //    OnTranslationCompleted;

          notifier.Activate();
        }

        Util.LogError("\nYou successfully uploaded a new model to the gallery!");
        Util.LogError("\nYour model is viewable at the following url:");

        Util.LogError("\n" + url + "\n");

        System.IO.File.Delete(filename);
      }
    }

    public void Deactivate()
    {
      // This method is called by Inventor when the AddIn is unloaded.
      // The AddIn will be unloaded either manually by the user or
      // when the Inventor session is terminated

      // TODO: Add ApplicationAddInServer.Deactivate implementation

      // Release objects.
      m_inventorApplication = null;

      GC.Collect();
      GC.WaitForPendingFinalizers();
    }

    public void ExecuteCommand(int commandID)
    {
      // Note:this method is now obsolete, you should use the 
      // ControlDefinition functionality for implementing commands.
    }

    public object Automation
    {
      // This property is provided to allow the AddIn to expose an API 
      // of its own to other programs. Typically, this  would be done by
      // implementing the AddIn's API interface in a class and returning 
      // that class object through this property.

      get
      {
        // TODO: Add ApplicationAddInServer.Automation getter implementation
        return null;
      }
    }

    #endregion

  }

  class Util
  {
    public static void LogError(string msg)
    {
      //ed.WriteMessage("\n" + msg + "\n");
      MsgBox.Show(msg, "Error");
    }

    private static Configuration GetConfig()
    {
      FileInfo fi = new FileInfo(
          System.Reflection.Assembly.GetExecutingAssembly().Location);

      string configPath = fi.DirectoryName + "\\" + "addin.config";

      Configuration config =
          ConfigurationManager.OpenMappedExeConfiguration(
              new ExeConfigurationFileMap { ExeConfigFilename = configPath },
              ConfigurationUserLevel.None);

      return config;
    }

    public static string GetGalleryUrl()
    {
      Configuration config = GetConfig();

      var url = config.AppSettings.Settings["GalleryUrl"].Value;

      return url;
    }

    public static void StoreUserInfo(string user, string email)
    {
      Configuration config = GetConfig();

      config.AppSettings.Settings["Username"].Value = user;

      config.AppSettings.Settings["Email"].Value = email;

      config.Save(ConfigurationSaveMode.Modified);
    }

    public static string GetUser()
    {
      Configuration config = GetConfig();

      return config.AppSettings.Settings["Username"].Value;
    }

    public static string GetEmail()
    {
      Configuration config = GetConfig();

      return config.AppSettings.Settings["Email"].Value;
    }
  }
}
