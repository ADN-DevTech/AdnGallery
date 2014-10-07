using System;
using System.IO;
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
        [CommandMethod("ListGalleryModels")]
        async static public void ListGalleryModelsCmd()
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

        [CommandMethod("UploadToGallery")]
        async static public void UploadToGalleryCmd()
        {
            FileUploadForm fUp = new FileUploadForm();

            var dialogResult = Autodesk.AutoCAD.ApplicationServices.Application.ShowModalDialog(fUp);

            if (dialogResult != System.Windows.Forms.DialogResult.OK)
                return;


            Document doc = Application.DocumentManager.MdiActiveDocument;
            Database db = doc.Database;
            Editor ed = doc.Editor;

            var bucketKey = "GalleryStagingTemp";

            // validates if file has name (ie saved at least once)
            FileInfo info = new FileInfo(db.Filename);

            if(info.Extension == ".dwt")
            {
                Utils.LogError("Please save the drawing before uploading to the gallery, aborting...");
                return;
            }

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
                return;
            }

            var fi = FileUploadInfo.CreateFromFile(objectKey, filename);

            var bucketData = new BucketCreationData(
                bucketKey, 
                BucketPolicyEnum.kTemporary);

            var response = await viewDataClient.UploadAndRegisterAsync(
                bucketData, fi);

            if (!response.IsOk())
            {
                Utils.LogError("Error: " + response.Error.Reason);
                return;
            }

            if(response is RegisterResponse)
            {
                RegisterResponse registerResponse = response as RegisterResponse;

                if (registerResponse.Result.ToLower() != "success")
                {
                    Utils.LogError("Registration failed: " + registerResponse.Result);
                    return;
                }

                var fileId = viewDataClient.GetFileId(
                    bucketKey,
                    objectKey);

                var modelName = info.Name.Substring(0, info.Name.Length - 4);

                var dbModel = new DBModel(
                    new Author("leefsmp", "philippe.leefsma@autodesk.com"),
                    modelName,
                    fileId,
                    fileId.ToBase64());

                var modelResponse = await Utils.AddModelToGalleryAsync(dbModel);

                if (!modelResponse.IsOk())
                {
                    Utils.LogError("Error: " + modelResponse.Error.ToString());
                    return;
                }

                ed.WriteMessage("\nYou successfully uploaded a new model to the gallery!");
                ed.WriteMessage("\nYour model is viewable at the following url:");

                ed.WriteMessage("\n" + UserSettings.GALLERY_URL + "/#/viewer?id=" + 
                    modelResponse.Model.Id + "\n");
            }
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
                UserSettings.GALLERY_URL);

            return await galleryClient.AddModelAsync(model);
        }

        async public static Task <DBModelListResponse> GetModelsAsync()
        {
            AdnGalleryClient galleryClient = new AdnGalleryClient(
                UserSettings.GALLERY_URL);

            return await galleryClient.GetModelsAsync();
        }
    }
}
