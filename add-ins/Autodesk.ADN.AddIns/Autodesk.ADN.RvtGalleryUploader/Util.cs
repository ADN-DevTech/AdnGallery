#region Namespaces
using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Autodesk.ADN.Toolkit.Gallery;
#endregion // Namespaces

namespace Autodesk.ADN.RvtGalleryUploader
{
  class Util
  {
    public static void LogError( string msg )
    {
      Debug.Print( msg );
    }

    async public static Task<DBModelResponse> AddModelToGalleryAsync(
        DBModel model )
    {
      AdnGalleryClient galleryClient 
        = new AdnGalleryClient(
          GalleryUrl );

      return await galleryClient.AddModelAsync( model );
    }

    async public static Task<DBModelListResponse> GetModelsAsync()
    {
      AdnGalleryClient galleryClient 
        = new AdnGalleryClient(
          GalleryUrl );

      return await galleryClient.GetModelsAsync();
    }

    public static string GalleryUrl
    {
      get
      {
        //FileInfo fi = new FileInfo(
        //    System.Reflection.Assembly.GetExecutingAssembly().Location );

        //string configPath = fi.DirectoryName + "\\" + "addin.config";

        //Configuration config =
        //    ConfigurationManager.OpenMappedExeConfiguration(
        //        new ExeConfigurationFileMap { ExeConfigFilename = configPath },
        //        ConfigurationUserLevel.None );

        //var url = config.AppSettings.Settings["GalleryUrl"].Value;

        return "http://54.68.100.140:3000";
      }
    }
  }
}
