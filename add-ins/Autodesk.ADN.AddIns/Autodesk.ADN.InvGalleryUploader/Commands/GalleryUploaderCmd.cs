using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

using Inventor;
using Autodesk.ADN.InvUtility.CommandUtils;
using Autodesk.ADN.Toolkit.Gallery.Dialogs;
using System.IO;
using Autodesk.ADN.Toolkit.ViewData;
using Autodesk.ADN.Toolkit.ViewData.DataContracts;
using Autodesk.ADN.Toolkit.Gallery;
using System.Threading;

////////////////////////////////////////////////////////////////////////////////////
// GalleryUploaderCmd Inventor Add-in Command
//  
// Author: Philippe Leefsma
// Creation date: 10/27/2014 10:01:45 AM
// 
////////////////////////////////////////////////////////////////////////////////////
namespace Autodesk.ADN.InvGalleryUploader
{
    [AdnCommandAttribute]
    public class GalleryUploaderCmd : AdnButtonCommandBase
    {
        public GalleryUploaderCmd(ApplicationAddInSite addInSite) :
            base(addInSite.Application)
        {
            AddInSite = addInSite;
        }

        public ApplicationAddInSite AddInSite
        {
            private set;
            get;
        }

        public override string DisplayName
        {
            get
            {
                return "Upload to\nGallery";
            }
        }

        public override string InternalName
        {
            get
            {
                return "Autodesk.ADN.InvGalleryUploader.GalleryUploaderCmd";
            }
        }

        public override CommandTypesEnum Classification
        {
            get
            {
                return CommandTypesEnum.kEditMaskCmdType;
            }
        }

        public override string ClientId
        {
            get
            {
                Type t = typeof(StandardAddInServer);
                return t.GUID.ToString("B");
            }
        }

        public override string Description
        {
            get
            {
                return "Upload to Viewer Gallery";
            }
        }

        public override string ToolTipText
        {
            get
            {
                return "Upload to Viewer Gallery";
            }
        }

        public override ButtonDisplayEnum ButtonDisplay
        {
            get
            {
                return ButtonDisplayEnum.kDisplayTextInLearningMode;
            }
        }

        public override string StandardIconName
        {
            get
            {
                return "Autodesk.ADN.InvGalleryUploader.resources.cloud.ico";
            }
        }

        public override string LargeIconName
        {
            get
            {
                return "Autodesk.ADN.InvGalleryUploader.resources.cloud.ico";
            }
        }

        async protected override void OnExecute(NameValueMap context)
        {
            FileUploadForm fUp = new FileUploadForm();

            fUp.UserName = Util.GetUser();
            fUp.EMail = Util.GetEmail();

            var syncContext = SynchronizationContext.Current;

            var dialogResult = fUp.ShowDialog();

            SynchronizationContext.SetSynchronizationContext(
                syncContext);

            if (dialogResult != System.Windows.Forms.DialogResult.OK)
            {
                Terminate();
                return;
            }

            if (fUp.StoreDetails)
            {
                Util.StoreUserInfo(fUp.UserName, fUp.EMail);
            }

            // the gallery bucket
            var bucketKey = "adn-viewer-gallery";

            // Generates unique file key
            string objectKey = Guid.NewGuid().ToString() + ".dwf";

            // Generate temp filename
            string filename = System.IO.Path.GetTempFileName() + ".dwf";

            if(!Util.ExportDwf(
                AddInSite.Application, 
                AddInSite.Application.ActiveDocument, 
                filename))
            {
                Terminate();
                return;
            }

            AdnViewDataClient viewDataClient = new AdnViewDataClient(
                UserSettings.BASE_URL,
                UserSettings.CONSUMER_KEY,
                UserSettings.CONSUMER_SECRET);

            var tokenResult = await viewDataClient.AuthenticateAsync();

            if (!tokenResult.IsOk())
            {
                Util.LogError("Authentication failed: " + tokenResult.Error.Reason);

                System.IO.File.Delete(filename);
                Terminate();
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
                Terminate();
                return;
            }

            if (response is RegisterResponse)
            {
                RegisterResponse registerResponse = response as RegisterResponse;

                if (registerResponse.Result.ToLower() != "success")
                {
                    Util.LogError("Registration failed: " + registerResponse.Result);

                    System.IO.File.Delete(filename);
                    Terminate();
                    return;
                }

                var name = AddInSite.Application.ActiveDocument.DisplayName;

                var modelName = name.Substring(0, name.Length - 4);

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
                    Terminate();
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

                    fProgress.Show();

                    notifier.Activate();
                }

                System.IO.File.Delete(filename);
            }

            Terminate();
        }

        protected override void OnHelp(NameValueMap context)
        {

        }

        protected override void OnLinearMarkingMenu(
           ObjectsEnumerator SelectedEntities,
           SelectionDeviceEnum SelectionDevice,
           CommandControls LinearMenu,
           NameValueMap AdditionalInfo)
        {
            // Add this button to linear context menu
            //LinearMenu.AddButton(ControlDefinition as ButtonDefinition, true, true, "", false);
        }

        protected override void OnRadialMarkingMenu(
            ObjectsEnumerator SelectedEntities,
            SelectionDeviceEnum SelectionDevice,
            RadialMarkingMenu RadialMenu,
            NameValueMap AdditionalInfo)
        {
            // Add this button to radial context menu
            //RadialMenu.NorthControl = ControlDefinition;
        }

        class Util
        {
            public static void LogError(string msg)
            {
                System.Windows.Forms.MessageBox.Show(msg);
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

            public static bool ExportDwf(
                Inventor.Application App, 
                Document doc, 
                string filename)
            {
                try
                {
                    TranslatorAddIn translator = App.ApplicationAddIns.get_ItemById(
                        "{0AC6FD95-2F4D-42CE-8BE0-8AEA580399E4}") as TranslatorAddIn;

                    Inventor.TranslationContext ctx = App.TransientObjects.CreateTranslationContext();
                    ctx.Type = Inventor.IOMechanismEnum.kFileBrowseIOMechanism;

                    Inventor.NameValueMap options = App.TransientObjects.CreateNameValueMap();

                    Inventor.DataMedium medium = App.TransientObjects.CreateDataMedium();

                    if (translator.get_HasSaveCopyAsOptions(medium, ctx, options))
                    {
                        options.set_Value("Launch_Viewer", 0);
                        options.set_Value("Publish_Mode", 62723);
                        options.set_Value("Publish_All_Sheets", 1);

                        Inventor.NameValueMap sheets = App.TransientObjects.CreateNameValueMap();
                        Inventor.NameValueMap sheetOptions = App.TransientObjects.CreateNameValueMap();

                        sheetOptions.Add("Name", "Sheet:1");
                        sheetOptions.Add("3DModel", false);
                        sheets.set_Value("Sheet1", sheetOptions);

                        options.set_Value("Sheets", sheets);
                    }

                    medium.FileName = filename;

                    translator.SaveCopyAs(doc, ctx, options, medium);

                    return true;
                }
                catch (Exception e)
                {
                    return false;
                }
            }

        }
    }
}
