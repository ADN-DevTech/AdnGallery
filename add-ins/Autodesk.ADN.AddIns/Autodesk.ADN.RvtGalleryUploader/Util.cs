#region Namespaces
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Autodesk.ADN.Toolkit.Gallery;
using WinForms = System.Windows.Forms;
#endregion // Namespaces

namespace Autodesk.ADN.RvtGalleryUploader
{
  class Util
  {
    const string _caption = "RvtGalleryUploader";

    /// <summary>
    /// Display an error message to the user.
    /// </summary>
    public static void LogError( string msg )
    {
      Debug.WriteLine( msg );
      WinForms.MessageBox.Show( msg,
        _caption,
        WinForms.MessageBoxButtons.OK,
        WinForms.MessageBoxIcon.Error );
    }

    #region Get Consumer Credentials
    const string _error_msg_format
      = "Invalid settings in '{0}':"
      + "\r\n\r\n{1}"
      + "\r\n\r\nPlease add {2} = ...";

    /// <summary>
    /// Report a syntax error reading 
    /// settings from text file.
    /// </summary>
    static bool SyntaxError( 
      string path, 
      string s, 
      string variable_name )
    {
      LogError( string.Format(
        _error_msg_format, path, s, variable_name ) );

      return false;
    }

    /// <summary>
    /// Retrieve a value for the specified variable
    /// from the given text file contents.
    /// </summary>
    static bool GetVariableValue(
      string path, 
      string s1,
      string variable_name,
      out string variable_value )
    {
      variable_value = null;

      int i = s1.IndexOf( variable_name );

      if( 0 > i )
      {
        return SyntaxError( path, s1, variable_name );
      }

      string s = s1.Substring( i + variable_name.Length );

      i = s.IndexOf( '=' );

      if( 0 > i )
      {
        return SyntaxError( path, s1, variable_name );
      }

      s = s.Substring( i + 1 );
      
      i = s.IndexOf( '\n' );

      if( 0 <= i )
      {
        s = s.Substring( 0, i );
      }

      variable_value = s.Trim();

      return true;
    }

    /// <summary>
    /// Remove averything following a hash character
    /// '#' from a line of text to trim it of comments.
    /// </summary>
    /// <param name="s"></param>
    /// <returns></returns>
    static string TrimComment( string s )
    {
      int i = s.IndexOf( '#' );
      if( 0 <= i ) { s = s.Substring( 0, i ); }
      return s.Trim();
    }

    /// <summary>
    /// Retrieve Autodesk View and Data API consumer 
    /// credentials from the given text file.
    /// </summary>
    public static bool GetConsumerCredentials(
      string path,
      out string key,
      out string secret )
    {
      if( !File.Exists(path))
      {
				throw new ArgumentException( string.Format( 
          "Credentials file '{0}' not found", path ) );
      }
      key = secret = null;

      string s = string.Join( "\n", 
        File.ReadLines( path )
          .Select<string, string>( a => TrimComment( a ) )
          .Where<string>( a => 0 < a.Length ));

      return GetVariableValue( path, s, "ConsumerKey", out key )
        &&  GetVariableValue( path, s, "ConsumerSecret", out secret );
    }
    #endregion // Get Consumer Credentials

    private static Configuration GetConfig()
    {
      string path = Assembly.GetExecutingAssembly().Location;
      string configPath = path + ".addin.config";

      Configuration config =
        ConfigurationManager.OpenMappedExeConfiguration(
          new ExeConfigurationFileMap { ExeConfigFilename = configPath },
          ConfigurationUserLevel.None );

      string[] keys = config.AppSettings.Settings.AllKeys;

      if( !keys.Contains<string>( "GalleryUrl" ) )
      {
        config.AppSettings.Settings.Add( "GalleryUrl", "http://viewer-stg.autodesk.io/node/gallery" );
      }
      if( !keys.Contains<string>( "Username" ) )
      {
        config.AppSettings.Settings.Add( "Username", "Jeremy" );
      }
      if( !keys.Contains<string>( "Email" ) )
      {
        config.AppSettings.Settings.Add( "Email", "jeremy.tammik@eur.autodesk.com" );
      }
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
