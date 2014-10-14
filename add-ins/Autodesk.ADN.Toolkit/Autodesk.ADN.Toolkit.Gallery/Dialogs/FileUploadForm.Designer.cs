namespace Autodesk.ADN.Toolkit.Gallery.Dialogs
{
    partial class FileUploadForm
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FileUploadForm));
            this.bOK = new System.Windows.Forms.Button();
            this.bCancel = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this._tbUsername = new System.Windows.Forms.TextBox();
            this._tbEmail = new System.Windows.Forms.TextBox();
            this.cbProgress = new System.Windows.Forms.CheckBox();
            this.cbStoreDetails = new System.Windows.Forms.CheckBox();
            this.SuspendLayout();
            // 
            // bOK
            // 
            this.bOK.Location = new System.Drawing.Point(232, 91);
            this.bOK.Name = "bOK";
            this.bOK.Size = new System.Drawing.Size(70, 21);
            this.bOK.TabIndex = 0;
            this.bOK.Text = "OK";
            this.bOK.UseVisualStyleBackColor = true;
            this.bOK.Click += new System.EventHandler(this.bOK_Click);
            // 
            // bCancel
            // 
            this.bCancel.Location = new System.Drawing.Point(308, 91);
            this.bCancel.Name = "bCancel";
            this.bCancel.Size = new System.Drawing.Size(70, 21);
            this.bCancel.TabIndex = 1;
            this.bCancel.Text = "Cancel";
            this.bCancel.UseVisualStyleBackColor = true;
            this.bCancel.Click += new System.EventHandler(this.bCancel_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(58, 13);
            this.label1.TabIndex = 2;
            this.label1.Text = "Username:";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(12, 33);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(35, 13);
            this.label2.TabIndex = 3;
            this.label2.Text = "Email:";
            // 
            // _tbUsername
            // 
            this._tbUsername.Location = new System.Drawing.Point(71, 6);
            this._tbUsername.Name = "_tbUsername";
            this._tbUsername.Size = new System.Drawing.Size(307, 20);
            this._tbUsername.TabIndex = 4;
            // 
            // _tbEmail
            // 
            this._tbEmail.Location = new System.Drawing.Point(71, 33);
            this._tbEmail.Name = "_tbEmail";
            this._tbEmail.Size = new System.Drawing.Size(307, 20);
            this._tbEmail.TabIndex = 5;
            // 
            // cbProgress
            // 
            this.cbProgress.AutoSize = true;
            this.cbProgress.Location = new System.Drawing.Point(15, 72);
            this.cbProgress.Name = "cbProgress";
            this.cbProgress.Size = new System.Drawing.Size(147, 17);
            this.cbProgress.TabIndex = 6;
            this.cbProgress.Text = "Show translation progress";
            this.cbProgress.UseVisualStyleBackColor = true;
            this.cbProgress.CheckedChanged += new System.EventHandler(this.cbProgress_CheckedChanged);
            // 
            // cbStoreDetails
            // 
            this.cbStoreDetails.AutoSize = true;
            this.cbStoreDetails.Location = new System.Drawing.Point(15, 95);
            this.cbStoreDetails.Name = "cbStoreDetails";
            this.cbStoreDetails.Size = new System.Drawing.Size(145, 17);
            this.cbStoreDetails.TabIndex = 7;
            this.cbStoreDetails.Text = "Remember upload details";
            this.cbStoreDetails.UseVisualStyleBackColor = true;
            this.cbStoreDetails.CheckedChanged += new System.EventHandler(this.cbStoreDetails_CheckedChanged);
            // 
            // FileUploadForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(389, 118);
            this.Controls.Add(this.cbStoreDetails);
            this.Controls.Add(this.cbProgress);
            this.Controls.Add(this._tbEmail);
            this.Controls.Add(this._tbUsername);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.bCancel);
            this.Controls.Add(this.bOK);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "FileUploadForm";
            this.Text = "File upload details";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button bOK;
        private System.Windows.Forms.Button bCancel;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TextBox _tbUsername;
        private System.Windows.Forms.TextBox _tbEmail;
        private System.Windows.Forms.CheckBox cbProgress;
        private System.Windows.Forms.CheckBox cbStoreDetails;
    }
}