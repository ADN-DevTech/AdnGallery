/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved 
// Written by Philippe Leefsma 2013 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted, 
// provided that the above copyright notice appears in all copies and 
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting 
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS. 
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC. 
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

namespace Autodesk.ADN.Toolkit.UI
{
    public class UIHelper
    {
        /////////////////////////////////////////////////////////////////////////////////
        // Removes invalid chars from filename
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static string GetValidFileName(
            string fileName, 
            char replacement = '_')
        {
            string result = fileName;

            foreach (char c in System.IO.Path.GetInvalidFileNameChars())
            {
                result = result.Replace(c, replacement);
            }

            return result;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Selects one or multiple files
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static string[] FileSelect(
            string title, 
            string filter, 
            bool multiselect = false)
        {
            var ofDlg =
                new System.Windows.Forms.OpenFileDialog();

            ofDlg.Title = title;
            ofDlg.InitialDirectory = System.Environment.GetFolderPath(
                System.Environment.SpecialFolder.DesktopDirectory);

            ofDlg.Filter = filter;
            ofDlg.FilterIndex = 1;
            ofDlg.Multiselect = multiselect;

            if (ofDlg.ShowDialog() != DialogResult.OK)
                return new string[]{};

            if (multiselect)
                return ofDlg.FileNames;
            else
                return new string[] 
                { 
                    ofDlg.FileName 
                };
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Selects folder
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static string FolderSelect(
            string title,
            bool showNewFolderButton = true,
            Environment.SpecialFolder rootFolder = 
            System.Environment.SpecialFolder.DesktopDirectory)
        {
            var fb = new FolderBrowserDialog();

            fb.Description = "title";

            fb.ShowNewFolderButton =
                showNewFolderButton;

            fb.RootFolder = rootFolder;

            fb.ShowNewFolderButton = true;

            if (fb.ShowDialog() != DialogResult.OK)
                return null;

            return fb.SelectedPath;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Prompts for saving file
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static string GetSaveFileName(string fileName)
        {
            string validName = UIHelper.GetValidFileName(fileName);

             System.Windows.Forms.SaveFileDialog sfd =
                new System.Windows.Forms.SaveFileDialog();

            sfd.InitialDirectory = System.Environment.GetFolderPath(
                System.Environment.SpecialFolder.Desktop);

            sfd.FileName = validName;

            System.IO.FileInfo fi = new System.IO.FileInfo(validName);

            sfd.Filter = "(*" + fi.Extension + ")|*" + fi.Extension;

            if (sfd.ShowDialog() != System.Windows.Forms.DialogResult.OK)
                return string.Empty;

            return sfd.FileName;
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Display centered error dialog
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static void DisplayError(Control parent, string msg, string caption)
        {
            using (new CenterWinDialog(parent))
            {
                System.Windows.Forms.MessageBox.Show(
                    msg,
                    caption,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Exclamation);
            }
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Gets filename without extension
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static string GetFileName(string fullFileName)
        {
            System.IO.FileInfo fi = new System.IO.FileInfo(fullFileName);

            return fi.Name.Substring(0, fi.Name.Length - fi.Extension.Length);
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Gets default browser path from registry
        //
        /////////////////////////////////////////////////////////////////////////////////
        public static string GetDefaultBrowserPath()
        {
            try
            {
                string browserPath = string.Empty;

                //Read default browser path from Win XP registry key
                var browserKey = Registry.ClassesRoot.OpenSubKey(@"HTTP\shell\open\command", false);

                //If browser path wasn't found, try Win Vista (and newer) registry key
                if (browserKey == null)
                {
                    browserKey = Registry.CurrentUser.OpenSubKey(
                        @"Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http", false); ;
                }

                //If browser path was found, clean it
                if (browserKey != null)
                {
                    //Remove quotation marks
                    browserPath = (browserKey.GetValue(null) as string).ToLower().Replace("\"", "");

                    //Cut off optional parameters
                    if (!browserPath.EndsWith("exe"))
                    {
                        browserPath = browserPath.Substring(0, browserPath.LastIndexOf(".exe") + 4);
                    }

                    browserKey.Close();
                }

                return browserPath;
            }
            catch
            {
                return string.Empty;
            }
        }

        /////////////////////////////////////////////////////////////////////////////////
        // Used to display Error MessageBox centered on parent
        //
        /////////////////////////////////////////////////////////////////////////////////
        public class CenterWinDialog : IDisposable
        {
            private int mTries = 0;
            private Control mOwner;

            public CenterWinDialog(Control owner)
            {
                mOwner = owner;
                owner.BeginInvoke(new MethodInvoker(findDialog));
            }

            private void findDialog()
            {
                // Enumerate windows to find the message box
                if (mTries < 0) return;
                EnumThreadWndProc callback = new EnumThreadWndProc(checkWindow);
                if (EnumThreadWindows(GetCurrentThreadId(), callback, IntPtr.Zero))
                {
                    if (++mTries < 10) mOwner.BeginInvoke(new MethodInvoker(findDialog));
                }
            }

            private bool checkWindow(IntPtr hWnd, IntPtr lp)
            {
                // Checks if <hWnd> is a dialog
                StringBuilder sb = new StringBuilder(260);
                GetClassName(hWnd, sb, sb.Capacity);
                if (sb.ToString() != "#32770") return true;
                // Got it
                Rectangle frmRect = new Rectangle(mOwner.Location, mOwner.Size);
                RECT dlgRect;
                GetWindowRect(hWnd, out dlgRect);
                MoveWindow(hWnd,
                    frmRect.Left + (frmRect.Width - dlgRect.Right + dlgRect.Left) / 2,
                    frmRect.Top + (frmRect.Height - dlgRect.Bottom + dlgRect.Top) / 2,
                    dlgRect.Right - dlgRect.Left,
                    dlgRect.Bottom - dlgRect.Top, true);
                return false;
            }

            public void Dispose()
            {
                mTries = -1;
            }

            // P/Invoke declarations
            private delegate bool EnumThreadWndProc(IntPtr hWnd, IntPtr lp);
            [DllImport("user32.dll")]
            private static extern bool EnumThreadWindows(int tid, EnumThreadWndProc callback, IntPtr lp);

            [DllImport("kernel32.dll")]
            private static extern int GetCurrentThreadId();

            [DllImport("user32.dll")]
            private static extern int GetClassName(IntPtr hWnd, StringBuilder buffer, int buflen);

            [DllImport("user32.dll")]
            private static extern bool GetWindowRect(IntPtr hWnd, out RECT rc);

            [DllImport("user32.dll")]
            private static extern bool MoveWindow(IntPtr hWnd, int x, int y, int w, int h, bool repaint);
            private struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
        }

        public static Form GetParentForm(Control control)
        {
            try
            {
                Control iterator = control.Parent;

                while (!(iterator is Form))
                    iterator = iterator.Parent;

                Form result = iterator as Form;

                return result;
            }
            catch
            {
                return null;
            }
        }
    }

    public static class MessageBoxExtensions
    {
        public static DialogResult ShowCentered(
            Control parent,
            string msg,
            string caption,
            MessageBoxButtons buttons,
            MessageBoxIcon icon)
        {
            using (new UIHelper.CenterWinDialog(parent))
            {
                return System.Windows.Forms.MessageBox.Show(
                    msg,
                    caption,
                    buttons,
                    icon);
            }
        }
    }

    /////////////////////////////////////////////////////////////
    // Use: a small utility class to create child dialogs
    //
    /////////////////////////////////////////////////////////////
    public class WindowWrapper : System.Windows.Forms.IWin32Window
    {
        private IntPtr mHwnd;

        public WindowWrapper(IntPtr handle)
        {
            mHwnd = handle;
        }

        public IntPtr Handle
        {
            get
            {
                return mHwnd;
            }
        }
    }
}
