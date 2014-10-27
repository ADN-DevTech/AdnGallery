using System;
using Inventor;
using System.Runtime.InteropServices;

////////////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.InvGalleryUploader Inventor Add-in
//  
// Author: Administrator
// Creation date: 10/27/2014 10:00:01 AM
// 
////////////////////////////////////////////////////////////////////////////////////
namespace Autodesk.ADN.InvGalleryUploader
{
    [GuidAttribute("eb15a998-0623-40c6-a06f-ea61f84cda3a"), ComVisible(true)]
    public class StandardAddInServer : Autodesk.ADN.InvUtility.AddIn.AdnAddInServer
    {
        public override void Activate(
            ApplicationAddInSite addInSiteObject,
            bool firstTime)
        {
            base.Activate(addInSiteObject, firstTime);

            // Forces exported types loading - issue in x64 Release
            System.Reflection.Assembly.GetExecutingAssembly().GetExportedTypes();
        }

        public override void Deactivate()
        {
            base.Deactivate();
        }

        public override string RibbonResource
        {
            get
            {
                return "Autodesk.ADN.InvGalleryUploader.resources.ribbons.xml";
            }
        }
    }
}
