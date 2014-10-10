namespace Autodesk.ADN.Toolkit.Gallery.Dialogs
{
    partial class ProgressForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(ProgressForm));
            this.label1 = new System.Windows.Forms.Label();
            this.progressBar = new System.Windows.Forms.ProgressBar();
            this.lbModel = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.lbProgress = new System.Windows.Forms.Label();
            this.cbClose = new System.Windows.Forms.CheckBox();
            this.linkModel = new System.Windows.Forms.LinkLabel();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(14, 14);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(39, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Model:";
            // 
            // progressBar
            // 
            this.progressBar.Location = new System.Drawing.Point(17, 64);
            this.progressBar.Name = "progressBar";
            this.progressBar.Size = new System.Drawing.Size(389, 24);
            this.progressBar.TabIndex = 1;
            // 
            // lbModel
            // 
            this.lbModel.AutoSize = true;
            this.lbModel.Location = new System.Drawing.Point(88, 14);
            this.lbModel.Name = "lbModel";
            this.lbModel.Size = new System.Drawing.Size(67, 13);
            this.lbModel.TabIndex = 2;
            this.lbModel.Text = "Model Name";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(14, 37);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(51, 13);
            this.label2.TabIndex = 3;
            this.label2.Text = "Progress:";
            // 
            // lbProgress
            // 
            this.lbProgress.AutoSize = true;
            this.lbProgress.Location = new System.Drawing.Point(88, 37);
            this.lbProgress.Name = "lbProgress";
            this.lbProgress.Size = new System.Drawing.Size(67, 13);
            this.lbProgress.TabIndex = 4;
            this.lbProgress.Text = "0% complete";
            // 
            // cbClose
            // 
            this.cbClose.AutoSize = true;
            this.cbClose.Location = new System.Drawing.Point(17, 96);
            this.cbClose.Name = "cbClose";
            this.cbClose.Size = new System.Drawing.Size(127, 17);
            this.cbClose.TabIndex = 5;
            this.cbClose.Text = "Close when complete";
            this.cbClose.UseVisualStyleBackColor = true;
            this.cbClose.CheckedChanged += new System.EventHandler(this.cbClose_CheckedChanged);
            // 
            // linkModel
            // 
            this.linkModel.AutoSize = true;
            this.linkModel.Enabled = false;
            this.linkModel.Location = new System.Drawing.Point(258, 97);
            this.linkModel.Name = "linkModel";
            this.linkModel.Size = new System.Drawing.Size(145, 13);
            this.linkModel.TabIndex = 6;
            this.linkModel.TabStop = true;
            this.linkModel.Text = "View my model on the Gallery";
            // 
            // ProgressForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(418, 121);
            this.Controls.Add(this.linkModel);
            this.Controls.Add(this.cbClose);
            this.Controls.Add(this.lbProgress);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.lbModel);
            this.Controls.Add(this.progressBar);
            this.Controls.Add(this.label1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MaximizeBox = false;
            this.Name = "ProgressForm";
            this.Text = "Translation Progress";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ProgressBar progressBar;
        private System.Windows.Forms.Label lbModel;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label lbProgress;
        private System.Windows.Forms.CheckBox cbClose;
        private System.Windows.Forms.LinkLabel linkModel;
    }
}