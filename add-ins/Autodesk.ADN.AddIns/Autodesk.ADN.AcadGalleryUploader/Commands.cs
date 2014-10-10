using System;
using System.Configuration;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Autodesk.ADN.Toolkit.Gallery;
using Autodesk.ADN.Toolkit.Gallery.Dialogs;
using Autodesk.ADN.Toolkit.ViewData;
using Autodesk.ADN.Toolkit.ViewData.DataContracts;
using Autodesk.AutoCAD.ApplicationServices;
using Autodesk.AutoCAD.DatabaseServices;
using Autodesk.AutoCAD.EditorInput;
using Autodesk.AutoCAD.Runtime;


namespace Autodesk.ADN.AcadGalleryUploader
{
    public class Commands
    {
        [CommandMethod("ADN", "ListGalleryModels", CommandFlags.Transparent)]
        async static public void ListGalleryModels()
        {
            Document doc = Application.DocumentManager.MdiActiveDocument;
            Database db = doc.Database;
            Editor ed = doc.Editor;

            var modelListResponse = await Utils.GetModelsAsync();

            if (!modelListResponse.IsOk())
            {
                Utils.LogError("Error: " + modelListResponse.Error.ToString());
                return;
            }

            foreach(var model in modelListResponse.Models)
            {
                ed.WriteMessage("\n - " + model.Name + " { urn: " + model.Urn + " }");
            }
        }

        [CommandMethod("ADN", "UploadToGallery", CommandFlags.Transparent)]
        async static public void UploadToGallery()
        {
            Document doc = Application.DocumentManager.MdiActiveDocument;
            Database db = doc.Database;
            Editor ed = doc.Editor;

            // validates if file has name (ie saved at least once)
            FileInfo info = new FileInfo(db.Filename);

            if (info.Extension == ".dwt")
            {
                Utils.LogError("Please save the drawing before uploading to the gallery, aborting...");
                return;
            }

            var syncContext = SynchronizationContext.Current;

            FileUploadForm fUp = new FileUploadForm();

            var dialogResult = Application.ShowModalDialog(fUp);

            if (dialogResult != System.Windows.Forms.DialogResult.OK)
                return;  

            SynchronizationContext.SetSynchronizationContext(
                syncContext);

            // the gallery bucket
            var bucketKey = "adn-viewer-gallery";

            // Generates unique file key
            string objectKey = Guid.NewGuid().ToString() + ".dwg";

            // Generate temp filename
            string filename = Path.GetTempFileName() + ".dwg";

            db.SaveAs(filename, DwgVersion.Current);

            AdnViewDataClient viewDataClient = new AdnViewDataClient(
                UserSettings.BASE_URL,
                UserSettings.CONSUMER_KEY,
                UserSettings.CONSUMER_SECRET);

            var tokenResult = await viewDataClient.AuthenticateAsync();

            if (!tokenResult.IsOk())
            {
                Utils.LogError("Authentication failed: " + tokenResult.Error.Reason);

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
                Utils.LogError("Error: " + response.Error.Reason);

                System.IO.File.Delete(filename);
                return;
            }

            if(response is RegisterResponse)
            {
                RegisterResponse registerResponse = response as RegisterResponse;

                if (registerResponse.Result.ToLower() != "success")
                {
                    Utils.LogError("Registration failed: " + registerResponse.Result);

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

                var modelResponse = await Utils.AddModelToGalleryAsync(dbModel);

                if (!modelResponse.IsOk())
                {
                    Utils.LogError("Error: " + modelResponse.Error.ToString());

                    System.IO.File.Delete(filename);
                    return;
                }

                var url = Utils.GetGalleryUrl() + "/#/viewer?id=" +
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

                    Application.ShowModelessDialog(fProgress);

                    notifier.OnTranslationCompleted += 
                        OnTranslationCompleted;

                    notifier.Activate();
                }              

                ed.WriteMessage("\nYou successfully uploaded a new model to the gallery!");
                ed.WriteMessage("\nYour model is viewable at the following url:");

                ed.WriteMessage("\n" + url + "\n");

                System.IO.File.Delete(filename);
            }
        }

        static void OnTranslationCompleted(
            ViewableResponse response)
        {
            // Translation complete ...
        }
    }

    class Utils
    {
        public static void LogError(string msg)
        {
            Document doc = Application.DocumentManager.MdiActiveDocument;
            Editor ed = doc.Editor;

            ed.WriteMessage("\n" + msg + "\n");
        }

        async public static Task <DBModelResponse> AddModelToGalleryAsync(
            DBModel model)
        {
            AdnGalleryClient galleryClient = new AdnGalleryClient(
                GetGalleryUrl());

            return await galleryClient.AddModelAsync(model);
        }

        async public static Task <DBModelListResponse> GetModelsAsync()
        {
            AdnGalleryClient galleryClient = new AdnGalleryClient(
                GetGalleryUrl());

            return await galleryClient.GetModelsAsync();
        }

        public static string GetGalleryUrl()
        {     
            FileInfo fi = new FileInfo(
                System.Reflection.Assembly.GetExecutingAssembly().Location);

            string configPath = fi.DirectoryName + "\\" + "addin.config";

            Configuration config =
                ConfigurationManager.OpenMappedExeConfiguration(
                    new ExeConfigurationFileMap { ExeConfigFilename = configPath },
                    ConfigurationUserLevel.None);

            var url = config.AppSettings.Settings["GalleryUrl"].Value;

            return url;
        }
    }
}
