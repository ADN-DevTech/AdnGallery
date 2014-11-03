#region Namespaces
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Reflection;
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

    private static Configuration GetConfig()
    {
      string path = Assembly.GetExecutingAssembly().Location;
      string dir = Path.GetDirectoryName( path );
      string configPath = Path.Combine( dir, "addin.config" );

      Configuration config =
        ConfigurationManager.OpenMappedExeConfiguration(
          new ExeConfigurationFileMap { ExeConfigFilename = configPath },
          ConfigurationUserLevel.None );

      return config;
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
        //return "http://54.68.100.140:3000";

        Configuration config = GetConfig();

        var url = config.AppSettings.Settings["GalleryUrl"].Value;

        return url;
      }
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

    public static void StoreUserInfo( string user, string email )
    {
      Configuration config = GetConfig();

      config.AppSettings.Settings["Username"].Value = user;

      config.AppSettings.Settings["Email"].Value = email;

      config.Save( ConfigurationSaveMode.Modified );
    }
  }
}
