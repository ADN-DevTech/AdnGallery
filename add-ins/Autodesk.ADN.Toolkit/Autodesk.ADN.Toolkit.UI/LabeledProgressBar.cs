////////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved 
// Written by Philippe Leefsma 2012 - ADN/Developer Technical Services
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
////////////////////////////////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace Autodesk.ADN.Toolkit.UI
{
    public class LabeledProgressBar : ProgressBar
    {
        public string LabelText
        {
            get;
            set;
        }

        public Color Color
        {
            get;
            set;
        }

        public LabeledProgressBar()
            : base()
        {
            Color = Color.Turquoise;

            Style = ProgressBarStyle.Continuous;

            this.SetStyle(
                ControlStyles.UserPaint |
                ControlStyles.AllPaintingInWmPaint |
                ControlStyles.OptimizedDoubleBuffer, true);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            Graphics gr = e.Graphics;

            string str = LabelText;

            using (SolidBrush brBG = new SolidBrush(Color))
            {
                e.Graphics.FillRectangle(brBG,
                    e.ClipRectangle.X,
                    e.ClipRectangle.Y,
                    e.ClipRectangle.Width * this.Value / this.Maximum,
                    e.ClipRectangle.Height);
            }

            gr.DrawString(str,
                Font,
                Brushes.Black,
                new PointF(this.Width / 2 - (gr.MeasureString(str, SystemFonts.DefaultFont).Width / 2.0F),
                this.Height / 2 - (gr.MeasureString(str, SystemFonts.DefaultFont).Height / 2.0F)));
        }
    } 
}
